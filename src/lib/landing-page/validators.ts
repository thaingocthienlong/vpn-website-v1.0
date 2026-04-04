import { z } from "zod";
import { LANDING_PAGE_PROVINCES } from "./constants";

export const landingLeadSchema = z.object({
    campaignId: z.string().uuid("Campaign ID không hợp lệ"),
    programId: z.string().uuid("Program ID không hợp lệ"),
    firstName: z.string().trim().min(1, "Tên là bắt buộc").max(50, "Tên tối đa 50 ký tự"),
    lastName: z.string().trim().min(2, "Họ và chữ lót là bắt buộc").max(100, "Họ và chữ lót tối đa 100 ký tự"),
    email: z.string().trim().email("Email không hợp lệ").max(255, "Email tối đa 255 ký tự"),
    phone: z.string().trim().regex(/^[0-9+\-\s]{8,15}$/, "Số điện thoại không hợp lệ"),
    gender: z.enum(["Nam", "Nữ"], { message: "Giới tính không hợp lệ" }),
    birthday: z.string().trim().min(4, "Ngày sinh là bắt buộc").max(30, "Ngày sinh không hợp lệ"),
    province: z.string().refine((value) => LANDING_PAGE_PROVINCES.includes(value), "Tỉnh/thành không hợp lệ"),
    position: z.string().trim().min(2, "Vị trí công tác là bắt buộc").max(200, "Vị trí công tác tối đa 200 ký tự"),
    workplace: z.string().trim().min(2, "Đơn vị công tác là bắt buộc").max(200, "Đơn vị công tác tối đa 200 ký tự"),
    discoverySource: z.string().trim().min(2, "Nguồn biết đến chương trình là bắt buộc").max(120, "Nguồn biết đến tối đa 120 ký tự"),
    discoverySourceOther: z.string().trim().max(120, "Nguồn bổ sung tối đa 120 ký tự").optional(),
    certificates: z.array(z.string().trim().max(160, "Chứng chỉ tối đa 160 ký tự")).max(5, "Tối đa 5 chứng chỉ").optional().default([]),
    sourceUrl: z.string().trim().url("Đường dẫn gửi form không hợp lệ"),
    captchaAnswer: z.string().trim().min(4, "Mã xác nhận là bắt buộc").max(8, "Mã xác nhận không hợp lệ"),
    agreementAccepted: z.boolean().refine((value) => value, {
        message: "Bạn cần đồng ý với chính sách bảo mật",
    }),
}).superRefine((value, ctx) => {
    if (value.discoverySource === "Khác" && !value.discoverySourceOther?.trim()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["discoverySourceOther"],
            message: "Vui lòng nhập nguồn biết đến chương trình",
        });
    }
});

export type LandingLeadInput = z.infer<typeof landingLeadSchema>;
