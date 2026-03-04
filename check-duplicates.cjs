const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  const records = await p.weeklyAnalytics.findMany({
    select: { id: true, clinicId: true, year: true, month: true, weekNumber: true, weekLabel: true },
    orderBy: [{ clinicId: 'asc' }, { year: 'asc' }, { month: 'asc' }, { weekNumber: 'asc' }]
  });
  
  console.log('Total records:', records.length);
  console.log('\nWeekLabel formats found:\n');
  
  const seen = new Set();
  records.forEach(r => {
    if (!seen.has(r.weekLabel)) {
      console.log(`  "${r.weekLabel}" → year=${r.year}, month=${r.month}, week=${r.weekNumber}`);
      seen.add(r.weekLabel);
    }
  });
  
  console.log('\n\nLooking for potential duplicates (same clinic + year + week):\n');
  
  const byKey = {};
  records.forEach(r => {
    const key = `${r.clinicId}|${r.year}|${r.month}|${r.weekNumber}`;
    if (!byKey[key]) byKey[key] = [];
    byKey[key].push(r);
  });
  
  let dupeCount = 0;
  Object.entries(byKey).forEach(([key, recs]) => {
    if (recs.length > 1) {
      dupeCount++;
      console.log(`  Duplicate ${dupeCount}: ${key.split('|').slice(1).join(', ')}`);
      recs.forEach(r => console.log(`    - ${r.id}: "${r.weekLabel}"`));
    }
  });
  
  if (dupeCount === 0) {
    console.log('  No exact duplicates found based on unique key (clinicId + year + month + weekNumber).');
  }
  
  await p.$disconnect();
})();
