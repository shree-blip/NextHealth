/**
 * Weekly Analytics CSV Import Script
 * ===================================
 * 
 * Imports historical weekly analytics data from a CSV file into the database.
 * 
 * Usage:
 *   node import-weekly-analytics.cjs <path-to-csv>
 * 
 * Example:
 *   node import-weekly-analytics.cjs weekly_analytics_template.csv
 * 
 * Features:
 *   - Maps clinicName → clinicId automatically (exact match, case-insensitive)
 *   - Auto-generates weekLabel in UI format if left blank
 *   - Auto-calculates derived metrics (CTR, CPC, CVR, etc.)
 *   - Uses upsert: unique key = clinicId + year + month + weekNumber (no duplicates)
 *   - Validates all rows before importing (dry-run first)
 *   - Blank/missing metric values default to 0
 * 
 * CSV Headers (exact names):
 *   clinicName, year, month, weekNumber, weekLabel,
 *   blogsPublished, avgRanking, totalTraffic, callsRequested,
 *   websiteVisits, directionClicks, metaImpressions, metaClicks,
 *   metaCTR, metaCPC, metaConversions, metaCostPerConversion, metaAdSpend,
 *   googleImpressions, googleClicks, googleCTR, googleCPC,
 *   googleConversions, googleCVR, googleCostPerConversion, googleTotalCost,
 *   socialPosts, socialViews, patientCount, digitalConversion,
 *   conversionRate, dailyPatientAvg
 * 
 * Notes:
 *   - metaCTR, metaCPC, metaCostPerConversion, googleCTR, googleCPC,
 *     googleCVR, googleCostPerConversion, dailyPatientAvg, conversionRate
 *     are auto-calculated from raw inputs. Values in these columns are
 *     overwritten by the calculated result.
 *   - weekLabel format: "2025 Week 44 (Oct 27–Nov 2)"
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ─── Month helpers ───
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function startOfWeekMonday(date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function formatShortDate(date) {
  return `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Generates the weekLabel in the exact format the app uses.
 * Example: "2025 Week 44 (Oct 27–Nov 2)"
 */
function generateWeekLabel(year, weekNumber) {
  const jan1 = new Date(year, 0, 1);
  let cursor = startOfWeekMonday(jan1);

  for (let w = 1; w < weekNumber; w++) {
    cursor = addDays(cursor, 7);
  }

  const start = new Date(cursor);
  const end = addDays(start, 6);
  return `${year} Week ${weekNumber} (${formatShortDate(start)}–${formatShortDate(end)})`;
}

// ─── Auto-calculation ───

function calcPercentage(numerator, denominator) {
  if (!denominator || denominator === 0) return 0;
  return Number(((numerator / denominator) * 100).toFixed(2));
}

function calcMoney(numerator, denominator) {
  if (!denominator || denominator === 0) return 0;
  return Number((numerator / denominator).toFixed(2));
}

function calculateDerivedMetrics(row) {
  const metaImpressions = row.metaImpressions || 0;
  const metaClicks = row.metaClicks || 0;
  const metaAdSpend = row.metaAdSpend || 0;
  const metaConversions = row.metaConversions || 0;

  const googleImpressions = row.googleImpressions || 0;
  const googleClicks = row.googleClicks || 0;
  const googleTotalCost = row.googleTotalCost || 0;
  const googleConversions = row.googleConversions || 0;

  const patientCount = row.patientCount || 0;
  const digitalConversion = row.digitalConversion || 0;

  return {
    metaCTR: calcPercentage(metaClicks, metaImpressions),
    metaCPC: calcMoney(metaAdSpend, metaClicks),
    metaCostPerConversion: calcMoney(metaAdSpend, metaConversions),
    googleCTR: calcPercentage(googleClicks, googleImpressions),
    googleCPC: calcMoney(googleTotalCost, googleClicks),
    googleCVR: calcPercentage(googleConversions, googleClicks),
    googleCostPerConversion: calcMoney(googleTotalCost, googleConversions),
    dailyPatientAvg: Number((patientCount / 7).toFixed(2)),
    conversionRate: calcPercentage(digitalConversion, patientCount),
  };
}

// ─── CSV Parsing ───

function parseCSV(content) {
  const lines = content.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    row._lineNumber = i + 1;
    rows.push(row);
  }

  return { headers, rows };
}

// ─── Integer and Float DB column sets ───

const INT_COLUMNS = new Set([
  'blogsPublished', 'totalTraffic', 'callsRequested', 'websiteVisits',
  'directionClicks', 'metaImpressions', 'metaClicks', 'metaConversions',
  'googleImpressions', 'googleClicks', 'googleConversions',
  'socialPosts', 'socialViews', 'patientCount', 'digitalConversion',
]);

const FLOAT_COLUMNS = new Set([
  'avgRanking', 'metaCTR', 'metaCPC', 'metaCostPerConversion', 'metaAdSpend',
  'googleCTR', 'googleCPC', 'googleCVR', 'googleCostPerConversion', 'googleTotalCost',
  'conversionRate', 'dailyPatientAvg',
]);

const ALL_METRIC_COLUMNS = [...INT_COLUMNS, ...FLOAT_COLUMNS];

// ─── Main ───

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: node import-weekly-analytics.cjs <path-to-csv>');
    process.exit(1);
  }

  const fullPath = path.resolve(csvPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
  }

  console.log(`\n📄 Reading CSV: ${fullPath}\n`);
  const content = fs.readFileSync(fullPath, 'utf8');
  const { headers, rows } = parseCSV(content);

  console.log(`   Headers: ${headers.join(', ')}`);
  console.log(`   Data rows: ${rows.length}\n`);

  // ─── Step 1: Fetch all clinics and build name→id map ───
  const clinics = await prisma.clinic.findMany({ select: { id: true, name: true } });
  const clinicNameToId = {};
  for (const c of clinics) {
    clinicNameToId[c.name.toLowerCase().trim()] = c.id;
  }

  console.log(`🏥 Found ${clinics.length} clinics in database:`);
  clinics.forEach((c) => console.log(`   • ${c.name} → ${c.id}`));
  console.log('');

  // ─── Step 2: Validate all rows ───
  const errors = [];
  const validated = [];

  for (const row of rows) {
    const line = row._lineNumber;
    const clinicName = (row.clinicName || '').trim();
    const clinicId = (row.clinicId || '').trim();
    const year = parseInt(row.year, 10);
    const month = parseInt(row.month, 10);
    const weekNumber = parseInt(row.weekNumber, 10);

    // Resolve clinic
    let resolvedClinicId = clinicId;
    if (!resolvedClinicId && clinicName) {
      resolvedClinicId = clinicNameToId[clinicName.toLowerCase().trim()];
      if (!resolvedClinicId) {
        errors.push(`Line ${line}: clinicName "${clinicName}" not found in database`);
        continue;
      }
    }
    if (!resolvedClinicId) {
      errors.push(`Line ${line}: Missing both clinicId and clinicName`);
      continue;
    }

    // Validate required fields
    if (isNaN(year) || year < 2020 || year > 2030) {
      errors.push(`Line ${line}: Invalid year "${row.year}"`);
      continue;
    }
    if (isNaN(month) || month < 1 || month > 12) {
      errors.push(`Line ${line}: Invalid month "${row.month}"`);
      continue;
    }
    if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 53) {
      errors.push(`Line ${line}: Invalid weekNumber "${row.weekNumber}"`);
      continue;
    }

    // Build metric values
    const metrics = {};
    let rowHasError = false;

    for (const col of ALL_METRIC_COLUMNS) {
      const raw = (row[col] || '').trim();
      if (raw === '') {
        metrics[col] = 0;
        continue;
      }
      const num = Number(raw);
      if (isNaN(num)) {
        errors.push(`Line ${line}: Invalid number for ${col}: "${raw}"`);
        rowHasError = true;
        break;
      }
      if (INT_COLUMNS.has(col) && !Number.isInteger(num)) {
        errors.push(`Line ${line}: ${col} must be a whole number, got "${raw}"`);
        rowHasError = true;
        break;
      }
      metrics[col] = num;
    }

    if (rowHasError) continue;

    // Auto-calculate derived fields
    const derived = calculateDerivedMetrics(metrics);
    Object.assign(metrics, derived);

    // Generate weekLabel if blank
    let weekLabel = (row.weekLabel || '').trim();
    if (!weekLabel) {
      weekLabel = generateWeekLabel(year, weekNumber);
    }

    validated.push({
      clinicId: resolvedClinicId,
      clinicName: clinicName || clinics.find((c) => c.id === resolvedClinicId)?.name || '?',
      year,
      month,
      weekNumber,
      weekLabel,
      ...metrics,
    });
  }

  // ─── Step 3: Report validation results ───
  if (errors.length > 0) {
    console.log(`❌ ${errors.length} validation error(s):\n`);
    errors.forEach((e) => console.log(`   ${e}`));
    console.log(`\n⚠️  Fix these errors and re-run. No data was imported.\n`);
    process.exit(1);
  }

  console.log(`✅ All ${validated.length} rows passed validation.\n`);

  // Check for duplicates within the CSV itself
  const seen = new Set();
  for (const v of validated) {
    const key = `${v.clinicId}|${v.year}|${v.month}|${v.weekNumber}`;
    if (seen.has(key)) {
      console.error(`❌ Duplicate row in CSV: ${v.clinicName} ${v.year} month=${v.month} week=${v.weekNumber}`);
      process.exit(1);
    }
    seen.add(key);
  }

  // ─── Step 4: Upsert all rows ───
  console.log(`📤 Importing ${validated.length} records (upsert mode — existing records will be updated)...\n`);

  let created = 0;
  let updated = 0;

  for (const v of validated) {
    const { clinicId, clinicName, year, month, weekNumber, weekLabel, ...metrics } = v;

    try {
      const existing = await prisma.weeklyAnalytics.findFirst({
        where: { clinicId, year, month, weekNumber },
        select: { id: true },
      });

      if (existing) {
        await prisma.weeklyAnalytics.update({
          where: { id: existing.id },
          data: { weekLabel, ...metrics },
        });
        updated++;
      } else {
        await prisma.weeklyAnalytics.create({
          data: { clinicId, year, month, weekNumber, weekLabel, ...metrics },
        });
        created++;
      }

      console.log(`   ✓ ${clinicName} — ${weekLabel}`);
    } catch (err) {
      console.error(`   ✗ ${clinicName} — ${weekLabel}: ${err.message}`);
    }
  }

  console.log(`\n🎉 Import complete!`);
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Total:   ${created + updated}\n`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
