const http = require("node:http");
const https = require("node:https");

const VERIFY_TIMEOUT_MS = 180000;
const REQUEST_TIMEOUT_MS = 15000;
const RETRY_DELAY_MS = 2000;
const MAX_PREVIEW_BYTES = 65536;

const targetUrl = process.argv[2];

if (!targetUrl) {
  console.error("Usage: node scripts/verify-url.js <url>");
  process.exit(1);
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, " ").trim() || "(no title)" : "(no title)";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function probeUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https:") ? https : http;
    const request = client.get(
      url,
      {
        headers: {
          "User-Agent": "dev-server-verifier",
          "Cache-Control": "no-cache",
        },
      },
      (response) => {
        const status = response.statusCode ?? 0;

        if (status >= 300 && status < 400) {
          const location = response.headers.location || "(redirect with no location)";
          response.resume();
          resolve({ status, title: location });
          return;
        }

        if (status >= 400) {
          response.resume();
          reject(new Error(`HTTP status ${status}`));
          return;
        }

        let preview = "";
        let settled = false;

        const finish = (title) => {
          if (settled) {
            return;
          }
          settled = true;
          response.destroy();
          resolve({ status, title });
        };

        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          if (settled) {
            return;
          }

          preview += chunk;
          if (preview.length > MAX_PREVIEW_BYTES) {
            preview = preview.slice(0, MAX_PREVIEW_BYTES);
          }

          const title = extractTitle(preview);
          if (title !== "(no title)") {
            finish(title);
          }
        });

        response.on("end", () => {
          finish(extractTitle(preview));
        });

        response.on("error", (error) => {
          if (settled) {
            return;
          }
          settled = true;
          reject(error);
        });
      },
    );

    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      request.destroy(new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms`));
    });

    request.on("error", reject);
  });
}

async function verifyUrl(url) {
  const deadline = Date.now() + VERIFY_TIMEOUT_MS;
  let lastError = "unknown";

  while (Date.now() < deadline) {
    try {
      const result = await probeUrl(url);
      console.log(`HTTP OK: ${result.status} - ${result.title}`);
      return;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    await sleep(RETRY_DELAY_MS);
  }

  throw new Error(lastError);
}

verifyUrl(targetUrl).catch((error) => {
  console.error(`HTTP verification failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
