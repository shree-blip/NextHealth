// fix-weekly-analytics-csv.cjs
// Usage: node fix-weekly-analytics-csv.cjs weekly_analytics_fixed.csv weekly_analytics_final.csv

const fs = require('fs');
const csv = require('csv-parser');
const { parse } = require('json2csv');

const columns = [
  "id","clinicId","weekLabel","year","month","weekNumber","blogsPublished","avgRanking","totalTraffic","callsRequested","websiteVisits","directionClicks","metaImpressions","metaClicks","metaCTR","metaConversions","metaAdSpend","googleImpressions","googleClicks","googleCTR","googleCPC","googleConversions","googleCVR","googleCostPerConversion","googleTotalCost","socialPosts","socialViews","patientCount","digitalConversion","conversionRate","dailyPatientAvg","createdAt","updatedAt"
];

if (process.argv.length < 4) {
  console.error('Usage: node fix-weekly-analytics-csv.cjs <input.csv> <output.csv>');
  process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = process.argv[3];

const rows = [];
fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (row) => {
    // Only keep columns defined in the schema
    const filtered = {};
    columns.forEach(col => filtered[col] = row[col] || '');
    rows.push(filtered);
  })
  .on('end', () => {
    const output = parse(rows, { fields: columns });
    fs.writeFileSync(outputFile, output);
    console.log(`Trimmed and ordered ${inputFile} to ${outputFile}`);
  });
