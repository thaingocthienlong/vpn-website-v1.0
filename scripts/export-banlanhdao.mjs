
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const filePath = 'c:\\Users\\longt\\Desktop\\website\\old\\database\\vie61786_vi_hl_cr.sql';
const validFilePath = 'c:\\Users\\longt\\Desktop\\website\\new\\banlanhdao.json';

const columns = [
    'id', 'stt_hienthi', 'anhdaidien', 'name', 'chucvu', 'mieutangan', 'duongdan',
    't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10',
    'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10',
    'xuongdong'
];

async function exportTable() {
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let jsonData = [];
    let insideInsert = false;
    let buffer = '';

    for await (const line of rl) {
        if (line.includes('INSERT INTO `banlanhdao`')) {
            insideInsert = true;
            buffer += line;
        } else if (insideInsert) {
            buffer += line;
            if (line.endsWith(';')) {
                insideInsert = false;
                // Parse buffer
                parseInsert(buffer, jsonData);
                buffer = '';
            }
        }
    }

    fs.writeFileSync(validFilePath, JSON.stringify(jsonData, null, 2));
    console.log(`Exported ${jsonData.length} records to ${validFilePath}`);
}

function parseInsert(sql, dataArray) {
    // Extract everything after VALUES
    const valuesPart = sql.substring(sql.indexOf('VALUES') + 6).trim();
    // Remove trailing semicolon
    const cleanValues = valuesPart.replace(/;$/, '');

    // Split by ),( 
    // This is tricky because strings can contain ),(
    // We'll use a regex or a simple parser

    let records = [];
    let currentRecord = '';
    let inQuote = false;
    let escape = false;

    // Remove first ( and last )
    // Actually the format is (val...), (val...), ...

    let balance = 0;
    let start = 0;

    for (let i = 0; i < cleanValues.length; i++) {
        const char = cleanValues[i];

        if (char === "'" && !escape) {
            inQuote = !inQuote;
        } else if (char === '\\') {
            escape = !escape;
        } else {
            escape = false;
        }

        if (!inQuote) {
            if (char === '(') balance++;
            if (char === ')') balance--;

            if (balance === 0 && char === ',' && cleanValues[i + 1] === '(') {
                // End of a record? Wait, usually records are separated by comma
                // (val1), (val2)
                // At index i is comma.
                // We extract from start to i (excluding comma)
                // Actually start should include the parens?
                // Let's just accumulate chars
            }
        }
    }

    // Easier approach: Regex match all `\((?:[^)(]+|(?<=\\)')+\)` is hard.
    // Let's use a split strategy on `),(` but protect quotes.

    const rawRecords = splitRecords(cleanValues);

    rawRecords.forEach(raw => {
        // raw is something like "(1, 'Name', ...)"
        // Remove outer parens
        const content = raw.trim().replace(/^\(/, '').replace(/\)$/, '');
        const values = splitValues(content);

        let recordObj = {};
        columns.forEach((col, idx) => {
            let val = values[idx];
            // Decode SQL string
            if (val && val.startsWith("'") && val.endsWith("'")) {
                val = val.slice(1, -1)
                    .replace(/\\'/g, "'")
                    .replace(/\\"/g, '"')
                    .replace(/\\\\/g, '\\')
                    .replace(/\\r/g, '\r')
                    .replace(/\\n/g, '\n');
            } else if (val === 'NULL') {
                val = null;
            } else if (!isNaN(val)) {
                val = Number(val);
            }
            recordObj[col] = val;
        });

        dataArray.push(recordObj);
    });
}

function splitRecords(str) {
    let records = [];
    let start = 0;
    let inQuote = false;
    let depth = 0;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === "'" && str[i - 1] !== '\\') inQuote = !inQuote;

        if (!inQuote) {
            if (char === '(') depth++;
            if (char === ')') depth--;

            if (depth === 0 && char === ',') {
                // Delimiter between records found? 
                // Records are like (..), (..)
                // So comma should be between ) and (
                // We can just rely on depth being 0
                // Wait, comma inside string is handled by inQuote
                // Comma inside parens (lists?) SQL doesn't have lists in values usually.
                // But let's assume depth check is enough.

                // Check if it's really a separator
                // (a), (b) -> comma at index after )
                // Capture from start to i
                records.push(str.substring(start, i).trim());
                start = i + 1;
            }
        }
    }
    records.push(str.substring(start).trim());
    return records.filter(r => r.length > 0);
}

function splitValues(str) {
    let values = [];
    let start = 0;
    let inQuote = false;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === "'" && str[i - 1] !== '\\') inQuote = !inQuote;

        if (!inQuote && char === ',') {
            values.push(str.substring(start, i).trim());
            start = i + 1;
        }
    }
    values.push(str.substring(start).trim());
    return values;
}

exportTable().catch(console.error);
