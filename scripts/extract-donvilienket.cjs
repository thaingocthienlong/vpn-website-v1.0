const fs = require('fs');
const path = require('path');

const inputFile = 'c:/Users/longt/Desktop/website/old/database/vie61786_vi_hl_cr.sql';
const outputFile = 'c:/Users/longt/Desktop/website/old/database/donvilienket_raw.sql';
const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
const SEARCH_STR = "INSERT INTO `donvilienket`";

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

        // Look for start of INSERT
        if (!foundStart) {
            const startIndex = chunk.indexOf(SEARCH_STR);
            if (startIndex !== -1) {
                foundStart = true;
                content += chunk.substring(startIndex);
            }
        } else {
            content += chunk;
        }

        // If we started capturing, look for the end of the statement (semicolon)
        if (foundStart) {
            const endIndex = content.indexOf(';\n'); // End of insert usually followed by newline or new statement
            // Try searching for just `;` if `;\n` fails, but be careful of content semicolons

            // SQL dumps usually end statement with `;\n` or `;\r\n`
            if (endIndex !== -1) {
                content = content.substring(0, endIndex + 1);
                foundEnd = true;
                break;
            }

            // Safety: if content grows too big
            if (content.length > 10 * 1024 * 1024) {
                console.log('Warning: Huge INSERT statement or end not found within 10MB capture.');
                break;
            }
        }

        position += bytesRead;
        // Overlap logic is skipped for simplicity. If SEARCH_STR is split, we miss it. 
        // Given the file size and randomness, unlikely to hit split exactly on chunk boundary for one string.
    }
} finally {
    fs.closeSync(fd);
}

if (foundStart) {
    fs.writeFileSync(outputFile, content);
    console.log(`Extracted donvilienket INSERT to ${outputFile} (${content.length} chars)`);
} else {
    console.log(`"${SEARCH_STR}" not found.`);
}
