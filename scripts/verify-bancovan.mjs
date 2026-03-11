
import fs from 'fs';

const file = 'c:/Users/longt/Desktop/website/new/bancovan.json';

try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log(`[PASS] JSON is valid. Total records: ${data.length}`);

    // Find specific record
    const target = data.find(r => r.name.includes("HỒ ĐỨC HÙNG"));
    if (target) {
        console.log(`[PASS] Record found: ${target.name} - ${target.chucvu}`);
    } else {
        console.error('[FAIL] Record "HỒ ĐỨC HÙNG" not found in JSON.');
        process.exit(1);
    }

    // Check required fields
    if (target.id && target.name && target.chucvu !== undefined) {
        console.log(`[PASS] Record has expected schema.`);
    } else {
        console.error(`[FAIL] Record is missing required fields: ${JSON.stringify(target)}`);
        process.exit(1);
    }
} catch (e) {
    console.error(`[FAIL] Error reading/parsing JSON: ${e.message}`);
    process.exit(1);
}
