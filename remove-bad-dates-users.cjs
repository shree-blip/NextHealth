// remove-bad-dates-users.cjs
// Usage: node remove-bad-dates-users.cjs users_final_import.csv users_final_ready.csv

const fs = require('fs');
const csv = require('csv-parser');
const { parse } = require('json2csv');

if (process.argv.length < 4) {
  console.error('Usage: node remove-bad-dates-users.cjs <input.csv> <output.csv>');
  process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = process.argv[3];

const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const rows = [];
fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (row) => {
    if (isoDateRegex.test(row.createdAt) && isoDateRegex.test(row.updatedAt)) {
      rows.push(row);
    }
  })
  .on('end', () => {
    const output = parse(rows);
    fs.writeFileSync(outputFile, output);
    console.log(`Removed rows with invalid or empty dates: ${inputFile} -> ${outputFile}`);
  });
