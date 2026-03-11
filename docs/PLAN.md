# 🚀 Hướng Dẫn Deploy File Toàn Tập (Không Dùng Lệnh Gõ Tay)

Tài liệu này hướng dẫn chi tiết từng nút bấm trên giao diện **MATBAO Plesk** để chạy Website Next.js một cách an toàn nhất, tránh hoàn toàn lỗi đầy ổ cứng và lỗi SSH.

---

## 🏁 BƯỚC 1: BUILD ỨNG DỤNG TRÊN MÁY TÍNH CÁ NHÂN
*(Mục đích: Vì giới hạn máy chủ Plesk rất khắt khe không cho phép cấp phát RAM và tạo nhiều process, ta bắt buộc phải build app thành gói hoàn chỉnh tại máy của bạn.)*

> **Làm việc trên máy tính (Local) của anh:**

1. Trở lại thư mục code dự án trên máy.
2. Mở Terminal / PowerShell.
3. Gõ lệnh: **`npm run build-standalone`**
4. Kịch bản tự động sẽ sinh ra thư mục `.next/standalone` chuẩn mượt. Bước này ĐÃ TỰ XOÁ bỏ thư viện `node_modules` của Windows để tránh xung đột mã máy (Native Bindings) khi đưa lên nền tảng Linux của Server.

---

## 📦 BƯỚC 2: NÉN FILE ZIP VÀ UPLOAD LÊN MÁY CHỦ
*(Mục đích: Đóng gói và đẩy thành quả lên Server)*

1. Vào thư mục dự án trên máy của anh, tìm đường dẫn: `new/.next/standalone`.
2. Truy cập VÀO BÊN TRONG thư mục `standalone` đó.
3. Bôi đen toàn bộ (Ctrl+A) tất cả các file hiển thị (bao gồm `public`, `.next`, `prisma`, `package.json`, `server.js`, v.v.).
4. Click chuột phải, chọn nén thành 1 file **`app.zip`**.
5. Đăng nhập vào Plesk → File Manager → vào ngay thư mục **`/vpn-app`** (thư mục root chứa code của website).
6. Upload file `app.zip` lên đó. Xong bấm chuột phải chọn **Extract** (Giải nén). Ghi đè toàn bộ nếu nó hỏi.

---

## ⚙️ BƯỚC 3: CÀI ĐẶT THƯ VIỆN & CẤU HÌNH NODE.JS
*(Mục đích: Báo cho Plesk biết cách chạy file `server.js` độc lập & Cài gói mã máy chuẩn C++ của Linux)*

1. Trở ra màn hình chính, nhấp vào tiện ích **Node.js** trên domain.
2. Thiết lập đúng y chang thế này:
   - **Application Root:** `/vpn-app`
   - **Document Root:** `/vpn-app/public`
   - **Application Startup File:** `server.js`
   - **Application Environment:** `production`
3. Cuộn xuống phần **Environment Variables**, bấm nút **Specify** (Thêm biến) và copy các biến từ file `.env.production` cũ vào. Phải chắc chắn có:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `file:./prisma/dev.db`
4. Cài đặt thư viện Hệ điều hành Linux ngay trên Plesk:
   - Kéo lên trên, nhấn nút **Run Script**, gõ chính xác: `plesk-install` rồi bấm Run. Đợi máy chủ tải thư viện (khoảng 1 phút).
   - Nhấn nút **Run Script** lần 2, gõ chính xác: `plesk-standalone-prisma` rồi bấm Run. Đợi máy chủ build Database Engine (khoảng vài giây).

---

## 🚀 BƯỚC 4: KHỞI ĐỘNG VÀ KIỂM TRA

1. Kéo lên góc trên bảng Node.js, bấm vào nút **Restart App** (Nút có hình mũi tên vòng cung).
2. Xong! Mở web `https://vienphuongnam.com.vn/` để xem website hoạt động siêu mượt. Mọi bế tắc về RAM/CPU/OS và xung đột máy chủ/Windows đã được vượt qua hoàn toàn!
