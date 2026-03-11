const fs = require('fs');

const rawSql = fs.readFileSync('c:/Users/longt/Desktop/website/old/database/donvilienket_raw.sql', 'utf8');

// Regex to match VALUES groups. 
// Values: (id, stt, image, name, chucvu, mieuta)
// Example: (6, 1, '/path', 'Name', 'URL', '')
const regex = /\(([^)]+)\)/g;

const records = [];
let match;

function cleanValue(val) {
    if (!val) return null;
    val = val.trim();
    if (val.startsWith("'") && val.endsWith("'")) {
        val = val.substring(1, val.length - 1);
        val = val.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    return val;
}

while ((match = regex.exec(rawSql)) !== null) {
    const row = match[1];

    // Split by comma ignoring quotes
    const values = [];
    let current = '';
    let inQuote = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === "'" && (i === 0 || row[i - 1] !== '\\')) {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            values.push(cleanValue(current));
            current = '';
            continue;
        }
        current += char;
    }
    values.push(cleanValue(current));

    // Schema: id, stt, image, name, chucvu (url), mieuta
    if (values.length >= 6) {
        records.push({
            id: values[0], // ID in donvilienket
            sortOrder: values[1],
            image: values[2],
            name: values[3],
            url: values[4], // 'chucvu' field seems to be URL
            description: values[5]
        });
    }
}

const outputPath = 'c:/Users/longt/Desktop/website/new/database/donvilienket.json';
fs.writeFileSync(outputPath, JSON.stringify(records, null, 2));
console.log(`Exported ${records.length} records to ${outputPath}`);
