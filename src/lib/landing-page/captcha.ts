import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "landing_page_captcha";
const DEFAULT_SECRET = "landing-page-dev-secret";
const CAPTCHA_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CAPTCHA_LENGTH = 5;
const CAPTCHA_TTL_MS = 10 * 60 * 1000;

interface CaptchaPayload {
    hash: string;
    expiresAt: number;
    nonce: string;
}

function getSecret() {
    return process.env.LANDING_PAGE_CAPTCHA_SECRET || process.env.NEXTAUTH_SECRET || DEFAULT_SECRET;
}

function toBase64Url(value: string) {
    return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
    return Buffer.from(value, "base64url").toString("utf8");
}

function hashCaptchaAnswer(answer: string, nonce: string) {
    return createHash("sha256")
        .update(`${answer.toUpperCase()}::${nonce}::${getSecret()}`)
        .digest("hex");
}

function signPayload(encodedPayload: string) {
    return createHmac("sha256", getSecret()).update(encodedPayload).digest("hex");
}

export function generateCaptchaCode(length = CAPTCHA_LENGTH) {
    const bytes = randomBytes(length);
    let result = "";

    for (let index = 0; index < length; index += 1) {
        result += CAPTCHA_ALPHABET[bytes[index] % CAPTCHA_ALPHABET.length];
    }

    return result;
}

export function buildCaptchaToken(answer: string) {
    const nonce = randomBytes(8).toString("hex");
    const payload: CaptchaPayload = {
        hash: hashCaptchaAnswer(answer, nonce),
        expiresAt: Date.now() + CAPTCHA_TTL_MS,
        nonce,
    };
    const encodedPayload = toBase64Url(JSON.stringify(payload));
    const signature = signPayload(encodedPayload);

    return `${encodedPayload}.${signature}`;
}

export function verifyCaptchaToken(token: string | undefined, answer: string) {
    if (!token || !answer) return false;

    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return false;

    const expectedSignature = signPayload(encodedPayload);
    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
        return false;
    }

    let payload: CaptchaPayload;

    try {
        payload = JSON.parse(fromBase64Url(encodedPayload)) as CaptchaPayload;
    } catch {
        return false;
    }

    if (!payload?.hash || !payload?.expiresAt || !payload?.nonce) return false;
    if (payload.expiresAt < Date.now()) return false;

    const providedHash = hashCaptchaAnswer(answer, payload.nonce);
    const payloadBuffer = Buffer.from(payload.hash, "hex");
    const providedBuffer = Buffer.from(providedHash, "hex");

    if (payloadBuffer.length !== providedBuffer.length) return false;

    return timingSafeEqual(payloadBuffer, providedBuffer);
}

export function getCaptchaCookieName() {
    return COOKIE_NAME;
}

export function renderCaptchaSvg(answer: string) {
    const width = 168;
    const height = 56;
    const chars = answer.split("");
    const noise = Array.from({ length: 10 }, (_, index) => {
        const x1 = 8 + (index * 15) % width;
        const y1 = 10 + (index * 7) % height;
        const x2 = width - x1 + (index % 3) * 4;
        const y2 = height - y1 + (index % 2) * 3;
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(147,197,253,0.25)" stroke-width="1.2" />`;
    }).join("");

    const text = chars.map((char, index) => {
        const x = 24 + index * 26;
        const y = 34 + ((index % 2) * 4 - 2);
        const rotate = (index % 2 === 0 ? -6 : 6) + index;
        return `<text x="${x}" y="${y}" transform="rotate(${rotate}, ${x}, ${y})" font-family="var(--font-momo-display), Arial, sans-serif" font-size="24" font-weight="700" fill="#eff6ff">${char}</text>`;
    }).join("");

    return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Mã xác nhận">
  <defs>
    <linearGradient id="landingCaptchaBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f2f79" />
      <stop offset="100%" stop-color="#173f97" />
    </linearGradient>
  </defs>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="16" fill="url(#landingCaptchaBg)" stroke="rgba(255,255,255,0.22)" />
  ${noise}
  ${text}
</svg>`.trim();
}
