const fs = require('fs');

const rawSql = fs.readFileSync('c:/Users/longt/Desktop/website/old/database/doitac_raw.sql', 'utf8');

// Regex to match VALUES groups: (1, 'Name', ...), (2, ...)
// We need to be careful about unescaped quotes inside strings, though the sample lookup suggests standard SQL escaping.
// The sample shows: (1, 'Name', 'Val', 'Val'),
const regex = /\(([^)]+)\)/g;

const records = [];
let match;

while ((match = regex.exec(rawSql)) !== null) {
    const row = match[1];
    // Split by comma BUT ignore commas inside quotes
    // Simple parser: iterate chars
    const values = [];
    let current = '';
    let inQuote = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === "'" && (i === 0 || row[i - 1] !== '\\')) { // simplistic quote check
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            values.push(cleanValue(current));
            current = '';
            continue;
        }
        current += char;
    }
    values.push(cleanValue(current));

    // Schema: id, name, anhdaidien, duongdan
    if (values.length >= 4) {
        records.push({
            id: values[0],
            name: values[1],
            image: values[2],
            url: values[3]
        });
    }
}

function cleanValue(val) {
    val = val.trim();
    if (val.startsWith("'") && val.endsWith("'")) {
        // Remove surrounding quotes and unescape
        val = val.substring(1, val.length - 1);
        // Replace SQL escapes
        val = val.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    return val;
}

const outputPath = 'c:/Users/longt/Desktop/website/new/database/doitac.json';
// Ensure dir exists
const path = require('path');
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(records, null, 2));
console.log(`Exported ${records.length} records to ${outputPath}`);
