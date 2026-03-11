import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log("🚀 Bắt đầu đóng gói ứng dụng cho MATBAO Plesk...");

try {
  // 1. Chạy Prisma Generate để có types check
  console.log("\n[1/4] Tạo Prisma Client...");
  execSync('npx prisma generate', { stdio: 'inherit' });

  // 2. Build Next.js
  console.log("\n[2/4] Đang biên dịch Next.js (có thể mất vài phút)...");
  execSync('npx next build', { stdio: 'inherit' });

  // 3. Chuẩn bị thư mục standalone
  console.log("\n[3/4] Xử lý thư mục standalone và sửa lỗi đa nền tảng (Windows -> Linux)...");
  
  const rootDir = process.cwd();
  const standaloneDir = path.join(rootDir, '.next', 'standalone');
  
  if (!fs.existsSync(standaloneDir)) {
    throw new Error("Không tìm thấy thư mục .next/standalone. Kiểm tra lại next.config.ts");
  }

  // --- BƯỚC 3.1: FLATTEN (Làm phẳng) DIRECTORY ---
  // Nếu Next.js nhận diện workspace (chứa folder 'new' bên trong standalone)
  // Ta phải mang tất cả ra ngoài root của standalone.
  const projectName = path.basename(rootDir); // thường là 'new'
  const nestedDir = path.join(standaloneDir, projectName);
  
  if (fs.existsSync(nestedDir)) {
    console.log(`  > Phát hiện thư mục lồng '${projectName}', đang đưa ra ngoài root...`);
    // Chuyển toàn bộ file/folder từ standalone/new/* ra standalone/*
    const items = fs.readdirSync(nestedDir);
    for (const item of items) {
      fs.renameSync(path.join(nestedDir, item), path.join(standaloneDir, item));
    }
    fs.rmdirSync(nestedDir); // Xóa thư mục rỗng 'new'
  }

  // --- BƯỚC 3.2: XOÁ NODE_MODULES RÁC (WINDOWS BINDINGS) ---
  // CỰC KỲ QUAN TRỌNG: Các thư viện Prisma và LibSQL lõi C++ được build trên Windows
  // Nếu copy lên Linux (Plesk) sẽ gây lỗi "503 Service Unavailable" ngay lập tức!
  // Vì thế, ta phải xoá node_modules ở trên máy này, để đem lên Server cài bản Linux.
  const standaloneNodeModules = path.join(standaloneDir, 'node_modules');
  if (fs.existsSync(standaloneNodeModules)) {
    console.log("  > Đang xoá Windows node_modules để tránh lỗi 503 trên Cloud Linux...");
    fs.rmSync(standaloneNodeModules, { recursive: true, force: true });
  }

  // --- BƯỚC 3.3: COPY FILE TĨNH & DATABASE ---
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

  const publicSrc = path.join(rootDir, 'public');
  if (fs.existsSync(publicSrc)) copyDir(publicSrc, path.join(standaloneDir, 'public'));

  const staticSrc = path.join(rootDir, '.next', 'static');
  if (fs.existsSync(staticSrc)) {
    const staticDest = path.join(standaloneDir, '.next', 'static');
    copyDir(staticSrc, staticDest);
  }

  const prismaDest = path.join(standaloneDir, 'prisma');
  if (!fs.existsSync(prismaDest)) fs.mkdirSync(prismaDest, { recursive: true });
  const devDbPath = path.join(rootDir, 'prisma', 'dev.db');
  if (fs.existsSync(devDbPath)) fs.copyFileSync(devDbPath, path.join(prismaDest, 'dev.db'));
  const schemaPath = path.join(rootDir, 'prisma', 'schema.prisma');
  if (fs.existsSync(schemaPath)) fs.copyFileSync(schemaPath, path.join(prismaDest, 'schema.prisma'));

  console.log("\n[4/4] 🟢 ĐÓNG GÓI HOÀN TẤT!");
  console.log("-------------------------------------------------");
  console.log("HƯỚNG DẪN UPLOAD LÊN PLESK (ĐÃ KHẮC PHỤC LỖI 503 NATIVE BINDINGS):");
  console.log("1. Mở thư mục '.next/standalone' trên máy tính của bạn.");
  console.log("2. Bôi đen tất cả, nén thành file app.zip.");
  console.log("3. Upload app.zip lên File Manager thả vào gốc thư mục /vpn-app và Giải nén.");
  console.log("4. Quan trọng: Mở Plesk > Node.js > Run Script: gõ 'npm install --omit=dev' để cài thư viện Core C++ cho Linux.");
  console.log("5. Mở Plesk > Node.js > Run Script: gõ 'npx prisma generate' để Build Database Engine.");
  console.log("6. Bấm Restart App.");
  console.log("-------------------------------------------------");

} catch (error) {
  console.error("❌ Xảy ra lỗi trong quá trình đóng gói:", error.message);
  process.exit(1);
}
