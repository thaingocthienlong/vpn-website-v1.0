import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log("🚀 Bắt đầu đóng gói ứng dụng cho MATBAO Plesk...");

try {
  // 1. Chạy Prisma Generate
  console.log("\n[1/4] Tạo Prisma Client...");
  execSync('npx prisma generate', { stdio: 'inherit' });

  // 2. Build Next.js
  console.log("\n[2/4] Đang biên dịch Next.js (có thể mất vài phút)...");
  execSync('npx next build', { stdio: 'inherit' });

  // 3. Chuẩn bị thư mục standalone
  console.log("\n[3/4] Sao chép các tệp tĩnh vào thư mục standalone...");
  
  const rootDir = process.cwd();
  const standaloneDir = path.join(rootDir, '.next', 'standalone');
  
  // Tạo thư mục nếu chưa có (Next.js config output: 'standalone' sẽ tự tạo)
  if (!fs.existsSync(standaloneDir)) {
    throw new Error("Không tìm thấy thư mục .next/standalone. Vui lòng đảm bảo 'output: \"standalone\"' đã được cấu hình trong next.config.ts");
  }

  // Hàm copy folder đệ quy
  const copyDir = (src, dest) => {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    
    for (const item of fs.readdirSync(src)) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      
      if (fs.lstatSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };

  // Copy thư mục public
  const publicSrc = path.join(rootDir, 'public');
  const publicDest = path.join(standaloneDir, 'public');
  if (fs.existsSync(publicSrc)) {
    copyDir(publicSrc, publicDest);
    console.log("  ✓ Đã chép thư mục public/");
  }

  // Copy thư mục .next/static
  const staticSrc = path.join(rootDir, '.next', 'static');
  const staticDest = path.join(standaloneDir, '.next', 'static');
  if (fs.existsSync(staticSrc)) {
    copyDir(staticSrc, staticDest);
    console.log("  ✓ Đã chép thư mục .next/static/");
  }

  // Copy file cơ sở dữ liệu (SQLite dev.db) và schema vào standalone folder để chạy được
  const prismaDest = path.join(standaloneDir, 'prisma');
  if (!fs.existsSync(prismaDest)) fs.mkdirSync(prismaDest, { recursive: true });
  
  const devDbPath = path.join(rootDir, 'prisma', 'dev.db');
  if (fs.existsSync(devDbPath)) {
    fs.copyFileSync(devDbPath, path.join(prismaDest, 'dev.db'));
    console.log("  ✓ Đã chép cơ sở dữ liệu Prisma (dev.db)");
  }

  const schemaPath = path.join(rootDir, 'prisma', 'schema.prisma');
  if (fs.existsSync(schemaPath)) {
    fs.copyFileSync(schemaPath, path.join(prismaDest, 'schema.prisma'));
  }

  console.log("\n[4/4] 🟢 ĐÓNG GÓI HOÀN TẤT!");
  console.log("-------------------------------------------------");
  console.log("HƯỚNG DẪN UPLOAD LÊN PLESK:");
  console.log("1. Mở thư mục '.next/standalone' trên máy tính của bạn.");
  console.log("2. Nén toàn bộ CÁC FILE VÀ THƯ MỤC BÊN TRONG thư mục 'standalone' thành file .zip.");
  console.log("3. Tải file .zip đó lên File Manager của Plesk (vào thư mục /vpn-app).");
  console.log("4. Giải nén ghi đè toàn bộ.");
  console.log("5. Trong cài đặt Node.js trên Plesk, đảm bảo Application Startup File là 'server.js' rồi bấm Restart App.");
  console.log("-------------------------------------------------");

} catch (error) {
  console.error("❌ Xảy ra lỗi trong quá trình đóng gói:", error.message);
  process.exit(1);
}
