const fs = require('fs');
const path = require('path');

const inputFile = 'c:/Users/longt/Desktop/website/old/database/vie61786_vi_hl_cr.sql';
const searchString = "INSERT INTO `doitac`";

const stream = fs.createReadStream(inputFile, { encoding: 'utf8', highWaterMark: 64 * 1024 });

let count = 0;
let buffer = '';

stream.on('data', (chunk) => {
    buffer += chunk;

    let index;
    while ((index = buffer.indexOf(searchString)) !== -1) {
        count++;
        // Remove processed part to avoid double counting, but carefully
        buffer = buffer.slice(index + searchString.length);
    }

    // Keep last part of buffer in case search string is split across chunks
    // Search string length is ~20 chars. Keep last 50 chars.
    if (buffer.length > 100) {
        buffer = buffer.slice(-50);
    }
});

stream.on('end', () => {
    console.log(`Found ${count} occurrences of "${searchString}"`);
});

stream.on('error', (err) => {
    console.error('Error reading file:', err);
});
