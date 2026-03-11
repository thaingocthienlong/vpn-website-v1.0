const fs = require('fs');

const rawSql = fs.readFileSync('c:/Users/longt/Desktop/website/old/database/donvilienket_raw.sql', 'utf8');

// Robust parser
// Format: INSERT INTO ... VALUES (....), (....);

let startIndex = rawSql.indexOf('VALUES');
if (startIndex === -1) {
    console.error("VALUES not found");
    process.exit(1);
}
startIndex += 6; // Skip VALUES

const records = [];
let currentRecord = [];
let currentValue = '';
let inQuote = false;
let inRecord = false;
let escape = false;

for (let i = startIndex; i < rawSql.length; i++) {
    const char = rawSql[i];

    if (inRecord) {
        if (inQuote) {
            if (escape) {
                currentValue += char;
                escape = false;
            } else if (char === '\\') {
                escape = true;
                // Keep backslash in value? SQL usually escapes ' as \', so we keep it or handle it.
                // For simplicity, keep it, clean later.
                currentValue += char;
            } else if (char === "'") {
                inQuote = false;
                currentValue += char;
            } else {
                currentValue += char;
            }
        } else {
            // Not in quote
            if (char === "'") {
                inQuote = true;
                currentValue += char;
            } else if (char === ',') {
                // End of value
                // Push value
                currentRecord.push(cleanValue(currentValue));
                currentValue = '';
            } else if (char === ')') {
                // End of record
                currentRecord.push(cleanValue(currentValue));
                currentValue = '';
                inRecord = false;

                // Process record
                // Schema: id, stt, image, name, url, description
                if (currentRecord.length >= 6) {
                    records.push({
                        id: currentRecord[0],
                        sortOrder: currentRecord[1],
                        image: currentRecord[2],
                        name: currentRecord[3],
                        url: currentRecord[4],
                        description: currentRecord[5]
                    });
                }
                currentRecord = [];
            } else {
                currentValue += char;
            }
        }
    } else {
        // Not in record, waiting for (
        if (char === '(') {
            inRecord = true;
            currentValue = '';
            currentRecord = [];
        }
    }
}

function cleanValue(val) {
    if (!val) return null;
    val = val.trim();
    if (val.startsWith("'") && val.endsWith("'")) {
        val = val.substring(1, val.length - 1);
        val = val.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    return val;
}

const outputPath = 'c:/Users/longt/Desktop/website/new/database/donvilienket.json';
fs.writeFileSync(outputPath, JSON.stringify(records, null, 2));
console.log(`Exported ${records.length} records to ${outputPath}`);
