// fix-csv-dates.js
// Usage: node fix-csv-dates.js <input.csv> <output.csv> <dateColumns>
// Example: node fix-csv-dates.js clinics.csv clinics_fixed.csv createdAt,updatedAt

const fs = require('fs');
const csv = require('csv-parser');
const { parse } = require('json2csv');

if (process.argv.length < 5) {
  console.error('Usage: node fix-csv-dates.js <input.csv> <output.csv> <dateColumns>');
  process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = process.argv[3];
const dateColumns = process.argv[4].split(',');

const rows = [];
fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (row) => {
    dateColumns.forEach((col) => {
      if (row[col] && /^\d{10,}$/.test(row[col])) {
        // Convert ms or s timestamp to ISO string
        let ms = row[col].length === 13 ? Number(row[col]) : Number(row[col]) * 1000;
        row[col] = new Date(ms).toISOString();
      }
    });
    rows.push(row);
  })
  .on('end', () => {
    const output = parse(rows);
    fs.writeFileSync(outputFile, output);
    console.log(`Converted ${inputFile} to ${outputFile}`);
  });
