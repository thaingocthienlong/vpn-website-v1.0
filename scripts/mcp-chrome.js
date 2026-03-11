const { spawn } = require('child_process');
const path = require('path');

// Crucial: No console.log() to stdout, as it breaks MCP JSON-RPC protocol.

const scriptPath = path.resolve(
    __dirname,
    '..',
    'node_modules',
    'chrome-devtools-mcp',
    'build',
    'src',
    'index.js'
);

const child = spawn('node', [scriptPath], {
    stdio: 'inherit',
    env: process.env
});

child.on('error', (err) => {
    console.error('MCP Server Error:', err);
    process.exit(1);
});

child.on('exit', (code) => {
    process.exit(code || 0);
});
