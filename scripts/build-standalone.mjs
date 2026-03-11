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

  // --- BƯỚC 3.2: TẠO MÔI TRƯỜNG LINUX TẠI ĐỊA PHƯƠNG ---
  // CỰC KỲ QUAN TRỌNG: Máy chủ Plesk (Linux) báo lỗi "Resource temporarily unavailable"
  // khi cố chạy lệnh 'npm install' do giới hạn RAM/Process của Shared Hosting.
  // GIẢI PHÁP: Tải và cài đặt trước thư viện Linux ngay trên máy Windows!
  const standaloneNodeModules = path.join(standaloneDir, 'node_modules');
  if (fs.existsSync(standaloneNodeModules)) {
    console.log("  > Đang xoá Windows node_modules cũ...");
    fs.rmSync(standaloneNodeModules, { recursive: true, force: true });
  }

  console.log("  > Đang tải core C++ (Linux x64) cho Prisma/LibSQL, vui lòng chờ khoảng 1-2 phút...");
  execSync('npm install --omit=dev --os=linux --cpu=x64 --no-audit --no-fund', { cwd: standaloneDir, stdio: 'inherit' });

  // Copy thư mục prisma trước khi generate
  const prismaDest = path.join(standaloneDir, 'prisma');
  if (!fs.existsSync(prismaDest)) fs.mkdirSync(prismaDest, { recursive: true });
  
  const devDbPath = path.join(rootDir, 'prisma', 'dev.db');
  if (fs.existsSync(devDbPath)) fs.copyFileSync(devDbPath, path.join(prismaDest, 'dev.db'));
  
  const schemaPath = path.join(rootDir, 'prisma', 'schema.prisma');
  if (fs.existsSync(schemaPath)) fs.copyFileSync(schemaPath, path.join(prismaDest, 'schema.prisma'));

  // Generate database engine cho Linux
  console.log("  > Đang Build Database Engine cho Linux host...");
  execSync('npx prisma generate', { cwd: standaloneDir, stdio: 'inherit' });

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

  console.log("\n[4/4] 🟢 ĐÓNG GÓI HOÀN TẤT!");
  console.log("-------------------------------------------------");
  console.log("HƯỚNG DẪN UPLOAD LÊN PLESK (ĐÃ TRÁNH MỌI LỖI TÀI NGUYÊN/NATIVE BINDINGS):");
  console.log("1. Mở thư mục '.next/standalone' trên máy tính của bạn.");
  console.log("2. Bôi đen tất cả, nén thành file app.zip.");
  console.log("3. Upload app.zip lên File Manager thả vào gốc thư mục /vpn-app và CÓ ĐÈ LÊN MỌI THỨ CŨ.");
  console.log("4. Quan trọng: Mở Plesk > Node.js và BẤM RESTART APP là Xong (Không cần gõ bất cứ dòng lệnh NPM nào nữa)!");
  console.log("-------------------------------------------------");

} catch (error) {
  console.error("❌ Xảy ra lỗi trong quá trình đóng gói:", error.message);
  process.exit(1);
}
