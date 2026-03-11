import { sendEmail, ADMIN_EMAIL } from "./email";

// ─── Helpers ────────────────────────────────────────────────────────────────

function infoRow(label: string, value: string): string {
    return `
    <tr>
        <td style="padding:8px 12px;color:#64748b;font-size:14px;border-bottom:1px solid #f1f5f9;width:140px;vertical-align:top;">${label}</td>
        <td style="padding:8px 12px;color:#1e293b;font-size:14px;border-bottom:1px solid #f1f5f9;">${value}</td>
    </tr>`;
}

function table(rows: string): string {
    return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">${rows}</table>`;
}

function badge(text: string, color: string = "#3b82f6"): string {
    return `<span style="display:inline-block;padding:4px 12px;background:${color};color:#fff;border-radius:20px;font-size:12px;font-weight:600;">${text}</span>`;
}

// ─── Template 1: Registration Confirmation (to Admin) ───────────────────────

interface RegistrationData {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    organization?: string | null;
    position?: string | null;
    message?: string | null;
    courseName: string;
}

export async function sendRegistrationToAdmin(data: RegistrationData): Promise<void> {
    const body = `
        <p style="color:#475569;font-size:14px;line-height:1.6;">
            Có đăng ký mới từ website. Vui lòng xem chi tiết bên dưới:
        </p>
        ${table(
        infoRow("Họ tên", `<strong>${data.fullName}</strong>`) +
        infoRow("Email", `<a href="mailto:${data.email}" style="color:#3b82f6;">${data.email}</a>`) +
        infoRow("Điện thoại", `<a href="tel:${data.phone}" style="color:#3b82f6;">${data.phone}</a>`) +
        (data.organization ? infoRow("Đơn vị", data.organization) : "") +
        (data.position ? infoRow("Chức vụ", data.position) : "") +
        infoRow("Khóa học", badge(data.courseName)) +
        (data.message ? infoRow("Ghi chú", data.message) : "")
    )}
        <p style="color:#94a3b8;font-size:12px;margin-top:16px;">
            Mã đăng ký: ${data.id}
        </p>`;

    await sendEmail({
        to: ADMIN_EMAIL,
        subject: `[SISRD] Đăng ký mới: ${data.fullName} - ${data.courseName}`,
        title: "📋 Đăng ký khóa học mới",
        body,
    });
}

// ─── Template 2: Registration Confirmation (to User) ────────────────────────

export async function sendRegistrationToUser(data: RegistrationData): Promise<void> {
    const body = `
        <p style="color:#475569;font-size:14px;line-height:1.6;">
            Xin chào <strong>${data.fullName}</strong>,
        </p>
        <p style="color:#475569;font-size:14px;line-height:1.6;">
            Cảm ơn bạn đã đăng ký khóa học tại Viện Phương Nam. Chúng tôi đã nhận được thông tin đăng ký của bạn.
        </p>
        ${table(
        infoRow("Khóa học", `<strong>${data.courseName}</strong>`) +
        infoRow("Họ tên", data.fullName) +
        infoRow("Email", data.email) +
        infoRow("Điện thoại", data.phone) +
        infoRow("Trạng thái", badge("Đã tiếp nhận", "#22c55e"))
    )}
        <p style="color:#475569;font-size:14px;line-height:1.6;">
            Chúng tôi sẽ liên hệ bạn trong thời gian sớm nhất để xác nhận đăng ký.
        </p>
        <p style="color:#475569;font-size:14px;line-height:1.6;">
            Nếu có thắc mắc, vui lòng liên hệ:<br>
            📞 <a href="tel:02873060996" style="color:#3b82f6;">028.7306.0996</a> |
            📧 <a href="mailto:info@sisrd.org.vn" style="color:#3b82f6;">info@sisrd.org.vn</a>
        </p>`;

    await sendEmail({
        to: data.email,
        subject: `[SISRD] Xác nhận đăng ký khóa học: ${data.courseName}`,
        title: "✅ Đăng ký thành công!",
        body,
    });
}

// ─── Template 3: New Contact Notification (to Admin) ────────────────────────

interface ContactData {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}

export async function sendContactToAdmin(data: ContactData): Promise<void> {
    const body = `
        <p style="color:#475569;font-size:14px;line-height:1.6;">
            Có tin nhắn liên hệ mới từ website:
        </p>
        ${table(
        infoRow("Họ tên", `<strong>${data.fullName}</strong>`) +
        infoRow("Email", `<a href="mailto:${data.email}" style="color:#3b82f6;">${data.email}</a>`) +
        (data.phone ? infoRow("Điện thoại", `<a href="tel:${data.phone}" style="color:#3b82f6;">${data.phone}</a>`) : "") +
        infoRow("Chủ đề", badge(data.subject, "#8b5cf6"))
    )}
        <div style="margin:16px 0;padding:16px;background:#f8fafc;border-radius:8px;border-left:4px solid #3b82f6;">
            <p style="margin:0;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;">Nội dung tin nhắn</p>
            <p style="margin:8px 0 0;color:#1e293b;font-size:14px;line-height:1.6;white-space:pre-wrap;">${data.message}</p>
        </div>
        <p style="color:#94a3b8;font-size:12px;margin-top:16px;">
            Mã liên hệ: ${data.id}
        </p>`;

    await sendEmail({
        to: ADMIN_EMAIL,
        subject: `[SISRD] Liên hệ mới: ${data.fullName} - ${data.subject}`,
        title: "📩 Liên hệ mới từ website",
        body,
    });
}

// ─── Template 4: Registration Status Update (to User) ───────────────────────

const STATUS_MAP: Record<string, { label: string; color: string; message: string }> = {
    NEW: { label: "Đã tiếp nhận", color: "#3b82f6", message: "Đăng ký của bạn đã được tiếp nhận. Chúng tôi sẽ liên hệ bạn sớm." },
    CONTACTED: { label: "Đã liên hệ", color: "#f59e0b", message: "Chúng tôi đã liên hệ bạn qua điện thoại/email. Vui lòng kiểm tra và phản hồi." },
    ENROLLED: { label: "Đã ghi danh", color: "#22c55e", message: "Chúc mừng! Bạn đã được ghi danh thành công vào khóa học." },
    CANCELLED: { label: "Đã hủy", color: "#ef4444", message: "Đăng ký của bạn đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ chúng tôi." },
};

interface StatusUpdateData {
    fullName: string;
    email: string;
    courseName: string;
    newStatus: string;
}

export async function sendStatusUpdateToUser(data: StatusUpdateData): Promise<void> {
    const status = STATUS_MAP[data.newStatus] || STATUS_MAP.NEW;

    const body = `
        <p style="color:#475569;font-size:14px;line-height:1.6;">
            Xin chào <strong>${data.fullName}</strong>,
        </p>
        <p style="color:#475569;font-size:14px;line-height:1.6;">
            Trạng thái đăng ký khóa học của bạn đã được cập nhật:
        </p>
        ${table(
        infoRow("Khóa học", `<strong>${data.courseName}</strong>`) +
        infoRow("Trạng thái mới", badge(status.label, status.color))
    )}
        <div style="margin:16px 0;padding:16px;background:#f0fdf4;border-radius:8px;border-left:4px solid ${status.color};">
            <p style="margin:0;color:#1e293b;font-size:14px;line-height:1.6;">${status.message}</p>
        </div>
        <p style="color:#475569;font-size:14px;line-height:1.6;">
            Nếu có thắc mắc, vui lòng liên hệ:<br>
            📞 <a href="tel:02873060996" style="color:#3b82f6;">028.7306.0996</a> |
            📧 <a href="mailto:info@sisrd.org.vn" style="color:#3b82f6;">info@sisrd.org.vn</a>
        </p>`;

    await sendEmail({
        to: data.email,
        subject: `[SISRD] Cập nhật đăng ký: ${status.label} - ${data.courseName}`,
        title: "🔔 Cập nhật trạng thái đăng ký",
        body,
    });
}
