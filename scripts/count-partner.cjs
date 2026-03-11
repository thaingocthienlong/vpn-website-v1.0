const fs = require('fs');
const path = require('path');

const inputFile = 'c:/Users/longt/Desktop/website/old/database/vie61786_vi_hl_cr.sql';
const searchString = "INSERT INTO `partner`";

const stream = fs.createReadStream(inputFile, { encoding: 'utf8', highWaterMark: 64 * 1024 });

let count = 0;
let buffer = '';

stream.on('data', (chunk) => {
    buffer += chunk;

    let index;
    while ((index = buffer.indexOf(searchString)) !== -1) {
        count++;
        buffer = buffer.slice(index + searchString.length);
    }

    if (buffer.length > 100) {
        buffer = buffer.slice(-50);
    }
});

stream.on('end', () => {
    console.log(`Found ${count} occurrences of "${searchString}"`);
});
