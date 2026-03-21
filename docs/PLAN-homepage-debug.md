# PLAN: Homepage Section & Footer Config Debug

## Vấn đề 1: Trắng bảng /admin/homepage và lỗi 500 khi fetch homepage public
**Phân tích nguyên nhân:** 
- Trang admin quản lý `HomepageSection` bị trắng do API lấy danh sách list bị lỗi 500.
- Mã lỗi server báo: `Unknown argument isPublished`. 
- Trong file `src/lib/homepage-service.ts` dòng 8, query đang gọi tìm kiếm bằng field `isPublished: true`, tuy nhiên Prisma schema của `HomepageSection` chỉ có field `isEnabled`.
**Giải pháp:**
- Đổi `isPublished` thành `isEnabled` trong `src/lib/homepage-service.ts`.

## Vấn đề 2: Footer không cập nhật khi đổi ở /admin/layout-config
**Phân tích nguyên nhân:**
- Khi user lưu thông tin contact, footer links ở `/admin/layout-config`, API sẽ Upsert vào bảng **`Configuration`** với group là `"footer"` hoặc `"header"`.
- Nhưng trong file **`src/components/layout/Footer.tsx`**, khi fetch dữ liệu, nó lại đi gọi API `/api/homepage` để tìm kiếm `HomepageSection` nào có `type === 'FOOTER'`. Nghĩa là Footer đang tìm nhầm bảng dữ liệu, dẫn đến việc không lấy được cấu hình mới lưu.
**Giải pháp:**
- Tạo một API route `/api/layout/route.ts` để đọc các thông tin chung từ bảng **`Configuration`** chứa `group: "header" | "footer"`.
- Chỉnh sửa `Footer.tsx` sang gọi `/api/layout` và map những configs như `address, phone, email, facebook...` trực tiếp từ bảng Configuration.

## Các tệp tin cần sửa đổi
1. `src/lib/homepage-service.ts` [Sửa 1 dòng `isPublished` -> `isEnabled`]
2. `src/app/api/layout/route.ts` [Tạo file nội dung mới để trả array Configs PUBLIC]
3. `src/components/layout/Footer.tsx` [Đổi API Fetch point và mapping data logic]

## Các bước kiểm tra
1. Kiểm tra build TypeScript: `npm run build`
2. Kiểm tra log trên Terminal nodeJS khi tải trang chủ để đảm bảo Prisma không bị lỗi.
3. Chỉnh sửa thử địa chỉ 123 Address ở `/admin/layout-config`, lưu và quay lại Homepage để xác nhận.
