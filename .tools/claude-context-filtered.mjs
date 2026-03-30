import { spawn } from "node:child_process";

const node = String.raw`C:\Users\Vien Phuong Nam\Desktop\d7a8\web\.tools\node-v22.22.1-win-x64\node.exe`;
const npxCli = String.raw`C:\Users\Vien Phuong Nam\Desktop\d7a8\web\.tools\node-v22.22.1-win-x64\node_modules\npm\bin\npx-cli.js`;

const child = spawn(node, [npxCli, "-y", "@zilliz/claude-context-mcp@latest"], {
  env: process.env,
  stdio: ["pipe", "pipe", "pipe"],
});

let stdoutBuffer = Buffer.alloc(0);

function drainStdout() {
  while (stdoutBuffer.length > 0) {
    const headerStart = stdoutBuffer.indexOf("Content-Length:");

    if (headerStart === -1) {
      const lastNewline = Math.max(
        stdoutBuffer.lastIndexOf(0x0a),
        stdoutBuffer.lastIndexOf(0x0d),
      );

      if (lastNewline === -1) {
        return;
      }

      process.stderr.write(stdoutBuffer.subarray(0, lastNewline + 1));
      stdoutBuffer = stdoutBuffer.subarray(lastNewline + 1);
      continue;
    }

    if (headerStart > 0) {
      process.stderr.write(stdoutBuffer.subarray(0, headerStart));
      stdoutBuffer = stdoutBuffer.subarray(headerStart);
      continue;
    }

    const headerEnd = stdoutBuffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) {
      return;
    }

    const header = stdoutBuffer.subarray(0, headerEnd).toString("utf8");
    const match = /Content-Length:\s*(\d+)/i.exec(header);

    if (!match) {
      process.stderr.write(stdoutBuffer.subarray(0, headerEnd + 4));
      stdoutBuffer = stdoutBuffer.subarray(headerEnd + 4);
      continue;
    }

    const bodyLength = Number(match[1]);
    const frameLength = headerEnd + 4 + bodyLength;

    if (stdoutBuffer.length < frameLength) {
      return;
    }

    process.stdout.write(stdoutBuffer.subarray(0, frameLength));
    stdoutBuffer = stdoutBuffer.subarray(frameLength);
  }
}

child.stdout.on("data", (chunk) => {
  stdoutBuffer = Buffer.concat([stdoutBuffer, chunk]);
  drainStdout();
});

child.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
});

process.stdin.on("data", (chunk) => {
  child.stdin.write(chunk);
});

process.stdin.on("end", () => {
  child.stdin.end();
});

child.on("close", (code, signal) => {
  if (stdoutBuffer.length > 0) {
    process.stderr.write(stdoutBuffer);
  }

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
