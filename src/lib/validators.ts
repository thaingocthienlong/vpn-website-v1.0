import { z } from "zod";

/**
 * Common field validators
 */
export const emailSchema = z
    .string()
    .email("Email không hợp lệ")
    .min(1, "Email là bắt buộc");

export const phoneSchema = z
    .string()
    .regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ (10-11 số)")
    .min(1, "Số điện thoại là bắt buộc");

export const slugSchema = z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ thường, số và dấu gạch ngang")
    .min(1, "Slug là bắt buộc");

/**
 * Registration form validation
 */
export const registrationSchema = z.object({
    fullName: z
        .string()
        .min(2, "Họ tên ít nhất 2 ký tự")
        .max(100, "Họ tên tối đa 100 ký tự"),
    email: emailSchema,
    phone: phoneSchema,
    courseId: z.string().uuid("Course ID không hợp lệ"),
    organization: z.string().max(200, "Tên tổ chức tối đa 200 ký tự").optional(),
    position: z.string().max(100, "Chức vụ tối đa 100 ký tự").optional(),
    message: z.string().max(1000, "Ghi chú tối đa 1000 ký tự").optional(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

/**
 * Contact form validation
 */
export const contactSchema = z.object({
    fullName: z
        .string()
        .min(2, "Họ tên ít nhất 2 ký tự")
        .max(100, "Họ tên tối đa 100 ký tự"),
    email: emailSchema,
    phone: phoneSchema, // Required to match Prisma schema
    subject: z
        .string()
        .min(5, "Tiêu đề ít nhất 5 ký tự")
        .max(200, "Tiêu đề tối đa 200 ký tự"),
    message: z
        .string()
        .min(10, "Nội dung ít nhất 10 ký tự")
        .max(5000, "Nội dung tối đa 5000 ký tự"),
    courseId: z.string().uuid("Course ID không hợp lệ").optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

/**
 * Parse Zod errors to API format
 */
export function parseZodErrors(error: z.ZodError) {
    return error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
    }));
}

/**
 * Validate and parse request body
 */
export async function validateBody<T>(
    request: Request,
    schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; errors: Array<{ field: string; message: string }> }> {
    try {
        const body = await request.json();
        const result = schema.safeParse(body);

        if (result.success) {
            return { success: true, data: result.data };
        }

        return { success: false, errors: parseZodErrors(result.error) };
    } catch {
        return { success: false, errors: [{ field: "body", message: "Invalid JSON" }] };
    }
}

/**
 * Query params validation for list endpoints
 */
export const listQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),
    locale: z.enum(["vi", "en"]).default("vi"),
    category: z.string().optional(),
    featured: z.coerce.boolean().optional(),
    search: z.string().optional(),
});

export type ListQueryInput = z.infer<typeof listQuerySchema>;
