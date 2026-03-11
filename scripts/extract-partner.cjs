const fs = require('fs');
const path = require('path');

const inputFile = 'c:/Users/longt/Desktop/website/old/database/vie61786_vi_hl_cr.sql';
const outputFile = 'c:/Users/longt/Desktop/website/old/database/partner_raw.sql';
const CHUNK_SIZE = 10 * 1024 * 1024;
const SEARCH_STR = "INSERT INTO `partner`";

const fd = fs.openSync(inputFile, 'r');
const buffer = Buffer.alloc(CHUNK_SIZE);
let bytesRead = 0;
let position = 0;
let foundStart = false;
let foundEnd = false;
let content = '';

try {
    while ((bytesRead = fs.readSync(fd, buffer, 0, CHUNK_SIZE, position)) > 0) {
        const chunk = buffer.toString('utf8', 0, bytesRead);

        if (!foundStart) {
            const startIndex = chunk.indexOf(SEARCH_STR);
            if (startIndex !== -1) {
                foundStart = true;
                content += chunk.substring(startIndex);
            }
        } else {
            content += chunk;
        }

        if (foundStart) {
            const endIndex = content.indexOf(';\n');
            if (endIndex !== -1) {
                content = content.substring(0, endIndex + 1);
                foundEnd = true;
                break;
            }

            if (content.length > 10 * 1024 * 1024) {
                console.log('Warning: Huge INSERT statement or end not found within 10MB capture.');
                break;
            }
        }

        position += bytesRead;
    }
} finally {
    fs.closeSync(fd);
}

if (foundStart) {
    fs.writeFileSync(outputFile, content);
    console.log(`Extracted partner INSERT to ${outputFile} (${content.length} chars)`);
} else {
    console.log(`"${SEARCH_STR}" not found.`);
}
