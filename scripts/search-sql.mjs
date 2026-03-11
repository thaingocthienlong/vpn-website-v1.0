
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const filePath = 'c:\\Users\\longt\\Desktop\\website\\old\\database\\vie61786_vi_hl_cr.sql';
const searchTerms = ['PHẠM TRƯỜNG SƠN', 'Phạm Trường Sơn', 'TRƯỜNG SƠN', 'Truong Son'];

async function search() {
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });


    let printingSchema = false;
    let schemaLines = 0;

    for await (const line of rl) {
        // Schema Search
        if (line.includes('CREATE TABLE `banlanhdao`')) {
            console.log("[FOUND SCHEMA]");
            console.log(line);
            printingSchema = true;
            schemaLines = 0;
            continue;
        }
        if (printingSchema) {
            console.log(line);
            schemaLines++;
            if (line.includes(';')) printingSchema = false; // End of create table
            if (schemaLines > 20) printingSchema = false; // Safety break
        }

        // Data Search
        if (line.includes('INSERT INTO `banlanhdao`')) {
            console.log("[FOUND DATA START]");
            console.log(line.substring(0, 1000)); // Print first 1000 chars to see columns
            // We only need one insert statement structure to know columns if checking matching
            // But we actually want to parse THIS table.
            // Let's stop after finding the first insert if we just want column info?
            // User wants to export THE table.
            // So we might as well write the export script now if we assume standard format.
            // But let's just inspect first.
            break;
        }
    }
}

search().catch(console.error);
