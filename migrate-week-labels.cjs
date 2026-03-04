/**
 * Week Label Migration Script
 * ============================
 * 
 * Converts old "Month Week N" format to "YYYY Week N (Date–Date)" format.
 * 
 * Old format examples:
 *   "November Week 1", "December Week 2", "February Week 4"
 * 
 * New format examples:
 *   "2025 Week 44 (Oct 27–Nov 2)", "2025 Week 45 (Nov 3–Nov 9)"
 * 
 * This script:
 *   1. Finds all records with old-format weekLabels
 *   2. Parses the month and week-of-month
 *   3. Calculates the actual Monday–Sunday date range
 *   4. Computes the correct sequential weekNumber (year-based)
 *   5. Generates the correct weekLabel
 *   6. Updates year, month, weekNumber, weekLabel
 *   7. Handles merges if corrected record collides with existing
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MONTH_NAMES = {
  'january': 1, 'february': 2, 'march': 3, 'april': 4,
  'may': 5, 'june': 6, 'july': 7, 'august': 8,
  'september': 9, 'october': 10, 'november': 11, 'december': 12,
};

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
 * Calculates the sequential week number (1-based) from the first Monday of the year.
 */
function getSequentialWeekNumber(date, year) {
  const jan1 = new Date(year, 0, 1);
  const firstMonday = startOfWeekMonday(jan1);
  const daysDiff = Math.floor((date.getTime() - firstMonday.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(daysDiff / 7) + 1;
}

/**
 * Generates the correct weekLabel in "YYYY Week N (Mon–Sun)" format.
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

/**
 * Parses old-format weekLabel like "November Week 1" and returns the actual Monday date.
 */
function parseOldFormatToMonday(weekLabel, year) {
  const match = weekLabel.match(/^([A-Za-z]+)\s+Week\s+(\d+)$/);
  if (!match) return null;
  
  const monthName = match[1].toLowerCase();
  const weekOfMonth = parseInt(match[2], 10);
  const monthNumber = MONTH_NAMES[monthName];
  
  if (!monthNumber || weekOfMonth < 1 || weekOfMonth > 5) return null;
  
  // Find the first Monday of this month
  const firstOfMonth = new Date(year, monthNumber - 1, 1);
  let firstMonday = startOfWeekMonday(firstOfMonth);
  
  // If the first Monday is before the month started, move forward a week
  if (firstMonday.getMonth() !== monthNumber - 1) {
    firstMonday = addDays(firstMonday, 7);
  }
  
  // Add (weekOfMonth - 1) weeks
  const targetMonday = addDays(firstMonday, (weekOfMonth - 1) * 7);
  return targetMonday;
}

/**
 * Merges metric values from source into target (sums or takes max).
 */
function mergeMetrics(target, source) {
  const intFields = [
    'blogsPublished', 'totalTraffic', 'callsRequested', 'websiteVisits',
    'directionClicks', 'metaImpressions', 'metaClicks', 'metaConversions',
    'googleImpressions', 'googleClicks', 'googleConversions',
    'socialPosts', 'socialViews', 'patientCount', 'digitalConversion',
  ];
  
  const floatFields = [
    'avgRanking', 'metaCTR', 'metaCPC', 'metaCostPerConversion', 'metaAdSpend',
    'googleCTR', 'googleCPC', 'googleCVR', 'googleCostPerConversion', 'googleTotalCost',
    'conversionRate', 'dailyPatientAvg',
  ];
  
  const merged = { ...target };
  
  // Sum integer fields
  intFields.forEach(field => {
    merged[field] = (target[field] || 0) + (source[field] || 0);
  });
  
  // Average float fields (or take max for ranking)
  floatFields.forEach(field => {
    if (field === 'avgRanking') {
      merged[field] = Math.max(target[field] || 0, source[field] || 0);
    } else {
      merged[field] = ((target[field] || 0) + (source[field] || 0)) / 2;
    }
  });
  
  return merged;
}

async function main() {
  console.log('\n🔍 Finding records with old weekLabel format...\n');
  
  const allRecords = await prisma.weeklyAnalytics.findMany({
    orderBy: [{ year: 'asc' }, { month: 'asc' }, { weekNumber: 'asc' }],
  });
  
  const oldFormatRecords = allRecords.filter(r => {
    return /^[A-Za-z]+\s+Week\s+\d+$/.test(r.weekLabel);
  });
  
  console.log(`   Found ${oldFormatRecords.length} records with old format`);
  console.log(`   Total records: ${allRecords.length}\n`);
  
  if (oldFormatRecords.length === 0) {
    console.log('✅ No old-format records found. All weekLabels are already in correct format.\n');
    await prisma.$disconnect();
    return;
  }
  
  console.log('📋 Old format records to migrate:\n');
  oldFormatRecords.slice(0, 10).forEach(r => {
    console.log(`   ${r.weekLabel} (clinic ${r.clinicId.slice(0, 8)}..., year=${r.year}, month=${r.month}, week=${r.weekNumber})`);
  });
  if (oldFormatRecords.length > 10) {
    console.log(`   ... and ${oldFormatRecords.length - 10} more`);
  }
  console.log('');
  
  console.log('🔄 Starting migration...\n');
  
  let updated = 0;
  let merged = 0;
  let skipped = 0;
  
  for (const record of oldFormatRecords) {
    try {
      const monday = parseOldFormatToMonday(record.weekLabel, record.year);
      
      if (!monday) {
        console.log(`   ⚠️  Could not parse: "${record.weekLabel}" (year=${record.year})`);
        skipped++;
        continue;
      }
      
      // Calculate correct values
      const correctYear = monday.getFullYear();
      const correctMonth = monday.getMonth() + 1;
      const correctWeekNumber = getSequentialWeekNumber(monday, correctYear);
      const correctWeekLabel = generateWeekLabel(correctYear, correctWeekNumber);
      
      console.log(`   "${record.weekLabel}" → "${correctWeekLabel}"`);
      
      // Check if a record already exists with the correct key
      const existing = await prisma.weeklyAnalytics.findFirst({
        where: {
          clinicId: record.clinicId,
          year: correctYear,
          month: correctMonth,
          weekNumber: correctWeekNumber,
          NOT: { id: record.id },
        },
      });
      
      if (existing) {
        // Merge data and delete the old record
        console.log(`      → Merging with existing record (${existing.id.slice(0, 8)}...)`);
        
        const mergedData = mergeMetrics(existing, record);
        
        await prisma.weeklyAnalytics.update({
          where: { id: existing.id },
          data: {
            weekLabel: correctWeekLabel,
            ...mergedData,
          },
        });
        
        await prisma.weeklyAnalytics.delete({
          where: { id: record.id },
        });
        
        merged++;
      } else {
        // Update the record in place
        await prisma.weeklyAnalytics.update({
          where: { id: record.id },
          data: {
            year: correctYear,
            month: correctMonth,
            weekNumber: correctWeekNumber,
            weekLabel: correctWeekLabel,
          },
        });
        
        updated++;
      }
    } catch (err) {
      console.log(`      ✗ Error processing "${record.weekLabel}": ${err.message}`);
      skipped++;
  }
  
  console.log(`\n✅ Migration complete!`);
  console.log(`   Updated in-place: ${updated}`);
  console.log(`   Merged duplicates: ${merged}`);
  console.log(`   Skipped (parse error): ${skipped}`);
  console.log(`   Total processed: ${oldFormatRecords.length}\n`);
  
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
