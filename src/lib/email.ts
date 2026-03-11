import nodemailer from "nodemailer";

// SMTP transporter — configured from .env
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const FROM = process.env.SMTP_FROM || "SISRD <noreply@sisrd.org.vn>";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@sisrd.org.vn";

/**
 * Wrap content in branded SISRD email template
 */
function wrapTemplate(title: string, body: string): string {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:32px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:28px 32px;text-align:center;">
                            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">
                                🏛️ Viện Phương Nam (SISRD)
                            </h1>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:32px;">
                            <h2 style="margin:0 0 20px;color:#1e293b;font-size:18px;">${title}</h2>
                            ${body}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
                            <p style="margin:0;color:#94a3b8;font-size:12px;">
                                © ${new Date().getFullYear()} Viện Phát triển nguồn lực xã hội Phương Nam
                            </p>
                            <p style="margin:4px 0 0;color:#94a3b8;font-size:12px;">
                                📞 028.7306.0996 | 📧 info@sisrd.org.vn
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

interface SendEmailOptions {
    to: string;
    subject: string;
    title: string;
    body: string;
}

/**
 * Send an email with SISRD branding. Fails gracefully (logs error, doesn't throw).
 */
export async function sendEmail({ to, subject, title, body }: SendEmailOptions): Promise<boolean> {
    // Skip if SMTP not configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("[Email] SMTP not configured, skipping email to:", to);
        return false;
    }

    try {
        await transporter.sendMail({
            from: FROM,
            to,
            subject,
            html: wrapTemplate(title, body),
        });
        console.log("[Email] Sent successfully to:", to);
        return true;
    } catch (error) {
        console.error("[Email] Failed to send to:", to, error);
        return false;
    }
}
