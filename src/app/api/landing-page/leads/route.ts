import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { errors, successResponse } from "@/lib/api-response";
import { getCaptchaCookieName, verifyCaptchaToken } from "@/lib/landing-page/captcha";
import { sendLandingLeadToAdmin, sendLandingLeadToUser } from "@/lib/landing-page/email";
import { sendLandingLeadToGoogleSheets } from "@/lib/landing-page/google-sheets";
import { landingLeadSchema } from "@/lib/landing-page/validators";

async function updateSheetSyncStatus(leadId: string, status: string) {
    try {
        await prisma.landingLead.update({
            where: { id: leadId },
            data: { sheetsSyncStatus: status },
        });
    } catch (error) {
        console.error("[LandingPage] Failed to update Google Sheets sync status", error);
    }
}

async function parseLeadRequestBody(request: NextRequest) {
    const contentType = request.headers.get("content-type") || "";

    const normalizeGender = (value: string) => {
        const normalized = value.trim().toLowerCase();
        if (normalized === "nam" || normalized === "male") {
            return "Nam";
        }
        if (normalized === "nữ" || normalized === "nu" || normalized === "female") {
            return "Nữ";
        }
        return value.trim();
    };

    if (contentType.includes("application/json")) {
        const json = await request.json();
        if (json && typeof json === "object" && typeof json.gender === "string") {
            return {
                ...json,
                gender: normalizeGender(json.gender),
            };
        }
        return json;
    }

    const formData = await request.formData();
    const value = (name: string) => {
        const field = formData.get(name);
        return typeof field === "string" ? field.trim() : "";
    };

    return {
        campaignId: value("campaignId"),
        programId: value("programId"),
        firstName: value("ten"),
        lastName: value("ho_lot"),
        email: value("emailcontact"),
        phone: value("phoneregister"),
        gender: normalizeGender(value("gioi_tinh")),
        birthday: value("ngay_sinh"),
        province: value("tinh_thanh"),
        position: value("vi_tri"),
        workplace: value("don_vi"),
        discoverySource: value("biet_qua"),
        discoverySourceOther: value("biet_qua_other") || undefined,
        certificates: formData.getAll("cc_loai[]")
            .map((item) => (typeof item === "string" ? item.trim() : ""))
            .filter(Boolean),
        sourceUrl: value("url") || request.nextUrl.href,
        captchaAnswer: value("captcha_challenge"),
        agreementAccepted: formData.has("agreement"),
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await parseLeadRequestBody(request);
        const validation = landingLeadSchema.safeParse(body);

        if (!validation.success) {
            return errors.validationError(
                validation.error.issues.map((issue) => ({
                    field: issue.path.join(".") || "body",
                    message: issue.message,
                })),
            );
        }

        const payload = validation.data;
        const cookieStore = await cookies();
        const captchaToken = cookieStore.get(getCaptchaCookieName())?.value;

        if (!verifyCaptchaToken(captchaToken, payload.captchaAnswer)) {
            return errors.badRequest("Mã captcha không đúng hoặc đã hết hạn");
        }

        cookieStore.delete(getCaptchaCookieName());

        const program = await prisma.landingProgram.findFirst({
            where: {
                id: payload.programId,
                campaignId: payload.campaignId,
                isPublished: true,
                campaign: {
                    isPublished: true,
                },
            },
            include: {
                campaign: true,
            },
        });

        if (!program) {
            return errors.notFound("Chương trình landing page");
        }

        const duplicateCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const existingLead = await prisma.landingLead.findFirst({
            where: {
                programId: program.id,
                submittedAt: {
                    gte: duplicateCutoff,
                },
                OR: [
                    { phone: payload.phone.trim() },
                    { email: payload.email.trim() },
                ],
            },
            select: { id: true },
        });

        if (existingLead) {
            return errors.badRequest("Anh/chị đã gửi đăng ký cho chương trình này trong vòng 24 giờ qua");
        }

        const fullName = `${payload.lastName} ${payload.firstName}`.replace(/\s+/g, " ").trim();
        const certificates = (payload.certificates || []).map((item) => item.trim()).filter(Boolean);

        const lead = await prisma.landingLead.create({
            data: {
                campaignId: program.campaignId,
                programId: program.id,
                fullName,
                firstName: payload.firstName.trim(),
                lastName: payload.lastName.trim(),
                phone: payload.phone.trim(),
                email: payload.email.trim(),
                gender: payload.gender,
                birthday: payload.birthday.trim(),
                province: payload.province,
                position: payload.position.trim(),
                workplace: payload.workplace.trim(),
                discoverySource: payload.discoverySource,
                discoverySourceOther: payload.discoverySource === "Khác" ? payload.discoverySourceOther?.trim() : undefined,
                certificatesJson: certificates.length > 0 ? JSON.stringify(certificates) : null,
                sourceUrl: payload.sourceUrl,
                status: "NEW",
                sheetsSyncStatus: process.env.LANDING_PAGE_GOOGLE_SHEETS_WEBHOOK_URL ? "PENDING" : "SKIPPED",
            },
        });

        const emailPayload = {
            campaignName: program.campaign.name,
            programTitle: program.title,
            fullName,
            phone: lead.phone,
            email: lead.email,
            gender: lead.gender || "",
            birthday: lead.birthday || "",
            province: lead.province || "",
            position: lead.position || "",
            workplace: lead.workplace || "",
            discoverySource: lead.discoverySource || "",
            discoverySourceOther: lead.discoverySourceOther || undefined,
            certificates,
            sourceUrl: lead.sourceUrl || payload.sourceUrl,
        };

        void sendLandingLeadToAdmin(emailPayload).catch(console.error);
        void sendLandingLeadToUser(emailPayload).catch(console.error);

        void sendLandingLeadToGoogleSheets({
            timestamp: lead.submittedAt.toLocaleString("vi-VN"),
            campaign: program.campaign.name,
            program: program.title,
            fullname: fullName,
            phone: lead.phone,
            email: lead.email,
            gender: lead.gender,
            birthday: lead.birthday,
            province: lead.province,
            position: lead.position,
            workplace: lead.workplace,
            source: lead.discoverySource === "Khác" && lead.discoverySourceOther
                ? `Khác: ${lead.discoverySourceOther}`
                : lead.discoverySource,
            certificates,
            origin: "Landing Page",
            sourceUrl: lead.sourceUrl,
        }).then((result) => {
            void updateSheetSyncStatus(lead.id, result.status);
        }).catch((error) => {
            console.error("[LandingPage] Google Sheets sync failed", error);
            void updateSheetSyncStatus(lead.id, "FAILED");
        });

        return successResponse(
            {
                id: lead.id,
                message: "Đăng ký thành công! Chúng tôi đã nhận được thông tin và sẽ gọi lại hỗ trợ trong thời gian sớm nhất.",
            },
            undefined,
            201,
        );
    } catch (error) {
        console.error("[LandingPage] Failed to create lead", error);
        return errors.serverError("Không thể gửi đăng ký. Vui lòng thử lại.");
    }
}
