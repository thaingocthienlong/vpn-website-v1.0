const http = require('http');

const BASE_URL = 'http://localhost:3000';

const ENDPOINTS = [
    '/api/homepage/sections',
    '/api/posts',
    '/api/courses',
    '/api/staff',
    '/api/partners',
    '/api/services',
    '/api/search?q=test'
];

function checkEndpoint(endpoint) {
    return new Promise((resolve) => {
        const start = Date.now();
        const url = `${BASE_URL}${endpoint}`;

        const req = http.get(url, (res) => {
            const duration = Date.now() - start;
            const status = res.statusCode;
            const type = res.headers['content-type'];

            // Consume response data to free up memory
            res.resume();

            if (status >= 200 && status < 300 && type && type.includes('application/json')) {
                console.log(`✅ [${status}] ${endpoint} - ${duration}ms`);
                resolve(true);
            } else {
                console.error(`❌ [${status}] ${endpoint} - Content-Type: ${type}`);
                resolve(false);
            }
        });

        req.on('error', (e) => {
            console.error(`❌ [Error] ${endpoint}: ${e.message}`);
            resolve(false);
        });
    });
}

async function checkEndpoints() {
    console.log(`🚀 Starting API Connectivity Check against ${BASE_URL}...\n`);

    let passed = 0;
    let failed = 0;

    for (const endpoint of ENDPOINTS) {
        const isSuccess = await checkEndpoint(endpoint);
        if (isSuccess) passed++;
        else failed++;
    }

    console.log(`\n📊 Result: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
}

checkEndpoints();
