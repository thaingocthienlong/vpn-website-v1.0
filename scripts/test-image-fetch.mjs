
import fetch from 'node-fetch';

const url = 'https://vienphuongnam.edu.vn/uploads/files/th%E1%BA%A7y%20Son(1).png';

async function test() {
    try {
        console.log(`Fetching ${url}...`);
        const res = await fetch(url, { method: 'HEAD' });
        console.log(`Status: ${res.status}`);
        if (!res.ok) console.log('Failed to fetch');
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();
