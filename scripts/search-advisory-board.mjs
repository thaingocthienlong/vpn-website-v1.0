
import fs from 'fs';

const dumpFile = 'c:/Users/longt/Desktop/website/old/database/vie61786_vi_hl_cr.sql';
const searchStr = 'HỒ ĐỨC HÙNG';

function search() {
    const content = fs.readFileSync(dumpFile, 'utf8');
    const lines = content.split('\n');

    let currentTable = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.trim().startsWith('INSERT INTO')) {
            const match = line.match(/INSERT INTO `([^`]+)`/);
            if (match) {
                currentTable = match[1];
            }
        }

        if (line.includes(searchStr)) {
            console.log(`Found "${searchStr}" at line ${i + 1}`);
            console.log(`In table: ${currentTable}`);
            console.log(`Line content subset: ${line.substring(0, 150)}...`);
            break;
        }
    }
}

search();
