# 🚀 Hướng Dẫn Deploy File Toàn Tập (Không Dùng Lệnh Gõ Tay)

Tài liệu này hướng dẫn chi tiết từng nút bấm trên giao diện **MATBAO Plesk** để chạy Website Next.js một cách an toàn nhất, tránh hoàn toàn lỗi đầy ổ cứng và lỗi SSH.

---

## 🏁 BƯỚC 1: BUILD ỨNG DỤNG TRÊN MÁY TÍNH CÁ NHÂN
*(Mục đích: Vì giới hạn máy chủ Plesk rất khắt khe, không cho phép cấp phát RAM và tạo nhiều process (nproc/ulimit) nên chúng ta bắt buộc phải build app thành gói hoàn chỉnh tại máy của bạn.)*

> **Làm việc trên máy tính (Local) của anh:**
1. Trở lại thư mục code dự án trên máy.
2. Mở Terminal / PowerShell.
3. Gõ lệnh: **`npm run build-standalone`**
4. Kịch bản tự động sẽ sinh ra thư mục `.next/standalone` chứa toàn bộ ứng dụng siêu nhẹ. Nó cũng đã tự copy file cấu hình và cơ sở dữ liệu (dev.db) vào đó.

---

## 📦 BƯỚC 2: NÉN FILE ZIP VÀ UPLOAD LÊN CÁP QUANG
*(Mục đích: Đóng gói và đẩy thành quả lên Server)*

1. Vào thư mục dự án trên máy của anh, tìm đường dẫn: `new/.next/standalone`.
2. Truy cập VÀO BÊN TRONG thư mục `standalone` đó.
3. Bôi đen toàn bộ (Ctrl+A) tất cả các file hiển thị (bao gồm `.next`, `public`, `server.js`, `node_modules`, v.v.).
4. Click chuột phải, chọn nén thành 1 file **`app.zip`**.
5. Đăng nhập vào Plesk → File Manager → vào ngay thư mục **`/vpn-app`** (thư mục root chứa code của website).
6. Upload file `app.zip` lên đó. Xong bấm chuột phải chọn **Extract** (Giải nén). Ghi đè toàn bộ nếu nó hỏi.

---

## ⚙️ BƯỚC 3: CẤU HÌNH NODE.JS & BIẾN MÔI TRƯỜNG TRÊN PLESK
*(Mục đích: Báo cho Plesk biết cách chạy file `server.js` độc lập)*

1. Trở ra màn hình chính, nhấp vào tiện ích **Node.js** trên domain.
2. Thiết lập đúng y chang thế này:
   - **Application Root:** `/vpn-app`
   - **Document Root:** `/vpn-app/public` (Nó lấy thư mục `public` giải nén từ zip)
   - **Application Startup File:** `server.js` (Lấy file `server.js` giải nén từ zip)
   - **Application Environment:** `production`
3. Cuộn xuống phần **Environment Variables**, bấm nút **Specify** (Thêm biến) và nhập các biến:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `file:./prisma/dev.db`
   - Các biến của Clerk, SMTP, Cloudinary (Copy từ file `new/.env.production` lúc nãy).

---

## 🚀 BƯỚC 4: KHỞI ĐỘNG VÀ KIỂM TRA

*(Tuyệt đối KHÔNG BẤM nút NPM Install hay Run Scripts nào nữa, vì gói Standalone đã tích hợp đầy đủ mọi thứ rồi!)*

1. Kéo lên góc trên bảng Node.js, bấm vào nút **Restart App** (Nút có hình mũi tên vòng cung).
2. Mở tab trình duyệt mới và truy cập `https://vienphuongnam.com.vn/` để xem website hoạt động siêu mượt. Mọi bế tắc về RAM/CPU/OS giới hạn trên Plesk đã được vượt qua hoàn toàn!

