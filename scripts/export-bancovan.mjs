
import fs from 'fs';
import readline from 'readline';

const filePath = 'c:\\Users\\longt\\Desktop\\website\\old\\database\\vie61786_vi_hl_cr.sql';
const validFilePath = 'c:\\Users\\longt\\Desktop\\website\\new\\bancovan.json';

const columns = [
    'id', 'stt_hienthi', 'anhdaidien', 'name', 'chucvu', 'mieutangan', 'duongdan',
    't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10',
    'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'
];

async function exportTable() {
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let jsonData = [];
    let insideInsert = false;
    let buffer = '';

    for await (const line of rl) {
        if (line.includes('INSERT INTO `bancovan`')) {
            insideInsert = true;
            buffer += line;
        } else if (insideInsert) {
            buffer += line;
            if (line.endsWith(';')) {
                insideInsert = false;
                parseInsert(buffer, jsonData);
                buffer = '';
            }
        }
    }

    fs.writeFileSync(validFilePath, JSON.stringify(jsonData, null, 2));
    console.log(`Exported ${jsonData.length} records to ${validFilePath}`);
}

function parseInsert(sql, dataArray) {
    const valuesPart = sql.substring(sql.indexOf('VALUES') + 6).trim();
    const cleanValues = valuesPart.replace(/;$/, '');

    const rawRecords = splitRecords(cleanValues);

    rawRecords.forEach(raw => {
        const content = raw.trim().replace(/^\(/, '').replace(/\)$/, '');
        const values = splitValues(content);

        let recordObj = {};
        columns.forEach((col, idx) => {
            let val = values[idx];
            if (val && val.startsWith("'") && val.endsWith("'")) {
                val = val.slice(1, -1)
                    .replace(/\\'/g, "'")
                    .replace(/\\"/g, '"')
                    .replace(/\\\\/g, '\\')
                    .replace(/\\r/g, '\r')
                    .replace(/\\n/g, '\n');
            } else if (val === 'NULL') {
                val = null;
            } else if (!isNaN(val) && val !== undefined) {
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
