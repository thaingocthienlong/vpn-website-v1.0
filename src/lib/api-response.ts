import { NextResponse } from "next/server";

/**
 * Standard API response format
 */
export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Array<{ field: string; message: string }>;
    };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a success response
 */
export function successResponse<T>(
    data: T,
    meta?: ApiSuccessResponse<T>["meta"],
    status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
    return NextResponse.json(
        {
            success: true as const,
            data,
            ...(meta && { meta }),
        },
        { status }
    );
}

/**
 * Create an error response
 */
export function errorResponse(
    code: string,
    message: string,
    status: number = 400,
    details?: Array<{ field: string; message: string }>
): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
        {
            success: false as const,
            error: {
                code,
                message,
                ...(details && { details }),
            },
        },
        { status }
    );
}

/**
 * Common error responses
 */
export const errors = {
    notFound: (resource: string = "Resource") =>
        errorResponse("NOT_FOUND", `${resource} không tìm thấy`, 404),

    badRequest: (message: string, details?: Array<{ field: string; message: string }>) =>
        errorResponse("BAD_REQUEST", message, 400, details),

    validationError: (details: Array<{ field: string; message: string }>) =>
        errorResponse("VALIDATION_ERROR", "Dữ liệu không hợp lệ", 422, details),

    unauthorized: () =>
        errorResponse("UNAUTHORIZED", "Vui lòng đăng nhập", 401),

    forbidden: () =>
        errorResponse("FORBIDDEN", "Không có quyền truy cập", 403),

    serverError: (message: string = "Lỗi hệ thống") =>
        errorResponse("SERVER_ERROR", message, 500),
};

/**
 * Parse query parameters for pagination
 */
export function getPaginationParams(searchParams: URLSearchParams) {
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
}

/**
 * Get locale from query params
 */
export function getLocale(searchParams: URLSearchParams): "vi" | "en" {
    const locale = searchParams.get("locale");
    return locale === "en" ? "en" : "vi";
}

/**
 * Build pagination meta
 */
export function buildPaginationMeta(page: number, limit: number, total: number) {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
}
