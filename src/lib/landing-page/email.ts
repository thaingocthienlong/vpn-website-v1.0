import { sendEmail, ADMIN_EMAIL } from "@/lib/email";

interface LandingLeadEmailPayload {
    campaignName: string;
    programTitle: string;
    fullName: string;
    phone: string;
    email: string;
    gender: string;
    birthday: string;
    province: string;
    position: string;
    workplace: string;
    discoverySource: string;
    discoverySourceOther?: string;
    certificates?: string[];
    sourceUrl: string;
}

function infoRow(label: string, value: string) {
    return `
    <tr>
        <td style="padding:8px 12px;color:#64748b;font-size:14px;border-bottom:1px solid #f1f5f9;width:170px;vertical-align:top;">${label}</td>
        <td style="padding:8px 12px;color:#1e293b;font-size:14px;border-bottom:1px solid #f1f5f9;">${value}</td>
    </tr>`;
}

function table(rows: string) {
    return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">${rows}</table>`;
}

export async function sendLandingLeadToAdmin(payload: LandingLeadEmailPayload) {
    const certificates = payload.certificates?.filter(Boolean) ?? [];
    const adminEmail = process.env.LANDING_PAGE_ADMIN_EMAIL || ADMIN_EMAIL;

    const body = `
        <p style="color:#475569;font-size:14px;line-height:1.6;">
            Có đăng ký mới từ landing page chiến dịch. Vui lòng xem chi tiết bên dưới:
        </p>
        ${table(
            infoRow("Chiến dịch", `<strong>${payload.campaignName}</strong>`) +
            infoRow("Chương trình", `<strong>${payload.programTitle}</strong>`) +
            infoRow("Họ và tên", payload.fullName) +
            infoRow("Điện thoại", payload.phone) +
            infoRow("Email", payload.email) +
            infoRow("Giới tính", payload.gender) +
            infoRow("Ngày sinh", payload.birthday) +
            infoRow("Tỉnh/Thành", payload.province) +
            infoRow("Vị trí công tác", payload.position) +
            infoRow("Đơn vị công tác", payload.workplace) +
            infoRow(
                "Nguồn biết đến",
                payload.discoverySource === "Khác" && payload.discoverySourceOther
                    ? `Khác: ${payload.discoverySourceOther}`
                    : payload.discoverySource,
            ) +
            (certificates.length > 0 ? infoRow("Chứng chỉ", certificates.map((item) => `• ${item}`).join("<br/>")) : "") +
            infoRow("Nguồn gửi form", `<a href="${payload.sourceUrl}" style="color:#2563eb">${payload.sourceUrl}</a>`)
        )}
    `;

    await sendEmail({
        to: adminEmail,
        subject: `[Landing Page] Đăng ký mới: ${payload.fullName} - ${payload.programTitle}`,
        title: "Đăng ký mới từ landing page",
        body,
    });
}

export async function sendLandingLeadToUser(payload: LandingLeadEmailPayload) {
    const body = `
        <p style="color:#475569;font-size:14px;line-height:1.6;">
            Xin chào <strong>${payload.fullName}</strong>,
        </p>
        <p style="color:#475569;font-size:14px;line-height:1.6;">
            Viện Phương Nam đã nhận được đăng ký tham gia chương trình <strong>${payload.programTitle}</strong> của anh/chị.
            Đội ngũ tư vấn sẽ chủ động liên hệ trong thời gian sớm nhất.
        </p>
        ${table(
            infoRow("Chiến dịch", payload.campaignName) +
            infoRow("Chương trình", payload.programTitle) +
            infoRow("Điện thoại", payload.phone) +
            infoRow("Email", payload.email)
        )}
    `;

    await sendEmail({
        to: payload.email,
        subject: `[Viện Phương Nam] Xác nhận đăng ký chương trình ${payload.programTitle}`,
        title: "Xác nhận đăng ký landing page",
        body,
    });
}
