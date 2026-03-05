const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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

function normalizeName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function parseCSV(content) {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) throw new Error('CSV must contain a header and data rows');

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    row._lineNumber = i + 1;
    rows.push(row);
  }

  return { headers, rows };
}

function toNumber(raw, column, line) {
  if (raw === '' || raw == null) return 0;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    throw new Error(`Line ${line}: Invalid numeric value for ${column}: "${raw}"`);
  }
  return parsed;
}

async function main() {
  const csvPathArg = process.argv[2] || 'weekly_analytics_final_weeklabel.csv';
  const csvPath = path.resolve(csvPathArg);

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }

  const content = fs.readFileSync(csvPath, 'utf8');
  const { rows } = parseCSV(content);

  const clinics = await prisma.clinic.findMany({ select: { id: true, name: true } });
  const clinicMap = new Map(clinics.map((c) => [normalizeName(c.name), c]));

  const prepared = [];
  const seen = new Set();

  for (const row of rows) {
    const line = row._lineNumber;
    const clinicName = (row.clinicName || '').trim();
    const normalizedClinicName = normalizeName(clinicName);
    const clinic = clinicMap.get(normalizedClinicName);

    if (!clinic) {
      throw new Error(`Line ${line}: clinicName not found in DB: "${clinicName}"`);
    }

    const year = toNumber(row.year, 'year', line);
    const month = toNumber(row.month, 'month', line);
    const weekNumber = toNumber(row.weekNumber, 'weekNumber', line);

    if (!Number.isInteger(year) || year < 2020 || year > 2035) {
      throw new Error(`Line ${line}: invalid year "${row.year}"`);
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new Error(`Line ${line}: invalid month "${row.month}"`);
    }
    if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 53) {
      throw new Error(`Line ${line}: invalid weekNumber "${row.weekNumber}"`);
    }

    const key = `${clinic.id}|${year}|${weekNumber}`;
    if (seen.has(key)) {
      throw new Error(`Line ${line}: duplicate record in CSV for clinic/year/week (${clinicName}, ${year}, ${weekNumber})`);
    }
    seen.add(key);

    const metrics = {};
    for (const col of ALL_METRIC_COLUMNS) {
      const raw = row[col];
      const num = toNumber(raw, col, line);

      if (INT_COLUMNS.has(col)) {
        metrics[col] = Math.round(num);
      } else {
        metrics[col] = num;
      }
    }

    prepared.push({
      clinicId: clinic.id,
      clinicName: clinic.name,
      year,
      month,
      weekNumber,
      weekLabel: (row.weekLabel || '').trim(),
      ...metrics,
    });
  }

  if (prepared.length === 0) {
    throw new Error('No rows parsed from CSV');
  }

  console.log(`Parsed ${prepared.length} rows from CSV.`);
  console.log('Deleting existing weekly analytics records...');
  await prisma.weeklyAnalytics.deleteMany({});

  const createData = prepared.map((record) => ({
    clinicId: record.clinicId,
    year: record.year,
    month: record.month,
    weekNumber: record.weekNumber,
    weekLabel: record.weekLabel,
    blogsPublished: record.blogsPublished,
    avgRanking: record.avgRanking,
    totalTraffic: record.totalTraffic,
    callsRequested: record.callsRequested,
    websiteVisits: record.websiteVisits,
    directionClicks: record.directionClicks,
    metaImpressions: record.metaImpressions,
    metaClicks: record.metaClicks,
    metaCTR: record.metaCTR,
    metaCPC: record.metaCPC,
    metaConversions: record.metaConversions,
    metaCostPerConversion: record.metaCostPerConversion,
    metaAdSpend: record.metaAdSpend,
    googleImpressions: record.googleImpressions,
    googleClicks: record.googleClicks,
    googleCTR: record.googleCTR,
    googleCPC: record.googleCPC,
    googleConversions: record.googleConversions,
    googleCVR: record.googleCVR,
    googleCostPerConversion: record.googleCostPerConversion,
    googleTotalCost: record.googleTotalCost,
    socialPosts: record.socialPosts,
    socialViews: record.socialViews,
    patientCount: record.patientCount,
    digitalConversion: record.digitalConversion,
    conversionRate: record.conversionRate,
    dailyPatientAvg: record.dailyPatientAvg,
  }));

  await prisma.weeklyAnalytics.createMany({ data: createData });

  const total = await prisma.weeklyAnalytics.count();
  console.log(`Import complete. WeeklyAnalytics total records: ${total}`);

  const byClinic = await prisma.clinic.findMany({
    select: {
      name: true,
      _count: { select: { weeklyAnalytics: true } },
    },
    orderBy: { name: 'asc' },
  });

  console.log('\nRecords by clinic:');
  for (const c of byClinic) {
    if (c._count.weeklyAnalytics > 0) {
      console.log(`- ${c.name}: ${c._count.weeklyAnalytics}`);
    }
  }

  const labels = await prisma.weeklyAnalytics.findMany({
    select: { weekLabel: true, year: true, weekNumber: true },
    orderBy: [{ year: 'asc' }, { weekNumber: 'asc' }],
    take: 5,
  });
  console.log('\nSample week labels:');
  labels.forEach((r) => console.log(`- ${r.weekLabel} [${r.year} W${r.weekNumber}]`));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
