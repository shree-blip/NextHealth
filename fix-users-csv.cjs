// fix-users-csv.cjs
// Usage: node fix-users-csv.cjs users_fixed.csv users_final.csv

const fs = require('fs');
const csv = require('csv-parser');
const { parse } = require('json2csv');

if (process.argv.length < 4) {
  console.error('Usage: node fix-users-csv.cjs <input.csv> <output.csv>');
  process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = process.argv[3];

const rows = [];
fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (row) => {
    // Remove rows with invalid ISO date in createdAt or updatedAt
    const isValidDate = (d) => !d || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(d);
    if (isValidDate(row.createdAt) && isValidDate(row.updatedAt)) {
      rows.push(row);
    }
  })
  .on('end', () => {
    const output = parse(rows);
    fs.writeFileSync(outputFile, output);
    console.log(`Cleaned ${inputFile} to ${outputFile}`);
  });
