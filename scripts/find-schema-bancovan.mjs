
import fs from 'fs';

const dumpFile = 'c:/Users/longt/Desktop/website/old/database/vie61786_vi_hl_cr.sql';

function findSchema() {
    const content = fs.readFileSync(dumpFile, 'utf8');
    const lines = content.split('\n');

    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.includes('CREATE TABLE `bancovan`')) {
            inTable = true;
        }

        if (inTable) {
            console.log(line);
            if (line.includes(';')) break;
        }
    }
}

findSchema();
