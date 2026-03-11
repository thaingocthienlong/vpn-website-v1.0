import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const DATA_FILE = path.join(__dirname, '../bancovan.json');
const UPLOADS_DIR = path.join(__dirname, '../old/httpdocs/uploads/images/nhanluc');

async function uploadToCloudinary(localPath, filename) {
    try {
        await fs.access(localPath);
        console.log(`Uploading ${filename}...`);
        const result = await cloudinary.uploader.upload(localPath, {
            folder: 'vienphuongnam/staff',
            public_id: path.parse(filename).name,
            overwrite: true
        });
        return result.secure_url;
    } catch (error) {
        console.log(`⚠️ Image not found or upload failed: ${localPath}`);
        return null;
    }
}

function isDepartment(record) {
    const hasNoAvatar = !record.anhdaidien || record.anhdaidien.trim() === '';
    const hasNoTitle = !record.chucvu || record.chucvu.trim() === '';
    return hasNoAvatar && hasNoTitle;
}

function extractTitle(htmlContent) {
    if (!htmlContent) return '';
    const match = htmlContent.match(/<strong>(.*?)<\/strong>/i);
    if (match && match[1]) return match[1].trim();
    return '';
}

function cleanBio(htmlContent) {
    if (!htmlContent) return '';
    let text = htmlContent.replace(/<[^>]+>/g, '').trim();
    return text.replace(/^(?:TRƯỞNG BAN|PHÓ TRƯỞNG BAN|THÀNH VIÊN|CỐ VẤN CHUYÊN MÔN)\s*/i, '').trim();
}

async function main() {
    const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
    const adapter = new PrismaLibSql({ url: databaseUrl });
    const prisma = new PrismaClient({ adapter });

    try {
        console.log('🚀 Starting Fresh Hội Đồng Cố Vấn Import...');

        const rawData = await fs.readFile(DATA_FILE, 'utf8');
        let records = JSON.parse(rawData);

        records.sort((a, b) => (a.stt_hienthi || 0) - (b.stt_hienthi || 0));

        let staffType = await prisma.staffType.findFirst({ where: { name: 'Hội đồng Cố vấn Khoa học' } });
        if (!staffType) {
            staffType = await prisma.staffType.create({
                data: { name: 'Hội đồng Cố vấn Khoa học', level: 2, sortOrder: 5 }
            });
        }

        let currentDeptId = null;
        let staffAdded = 0;

        for (const r of records) {
            const name = r.name ? r.name.trim() : '';
            if (!name) continue;

            if (isDepartment(r)) {
                console.log(`\n🏢 Creating Advisory Department: ${name}`);
                const dept = await prisma.department.create({
                    data: {
                        name: name,
                        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        sortOrder: r.stt_hienthi || 0
                    }
                });
                currentDeptId = dept.id;
                continue;
            }

            let extractedTitle = extractTitle(r.chucvu);
            if (!extractedTitle) extractedTitle = r.chucvu ? r.chucvu.replace(/(<([^>]+)>)/gi, "").trim() : 'Thành viên';
            const cleanedBio = cleanBio(r.chucvu);

            console.log(`👤 Importing to Advisory Board: ${name} (${extractedTitle}) -> Dept: ${currentDeptId || 'Top Level'}`);

            let avatarUrl = null;
            if (r.anhdaidien) {
                const localPath = path.join(UPLOADS_DIR, r.anhdaidien);
                avatarUrl = await uploadToCloudinary(localPath, r.anhdaidien);
            }

            let avatarData = undefined;
            if (avatarUrl) {
                const media = await prisma.media.create({
                    data: {
                        url: avatarUrl,
                        type: 'IMAGE',
                        purpose: 'AVATAR',
                        filename: r.anhdaidien
                    }
                });
                avatarData = { connect: { id: media.id } };
            }

            await prisma.staff.create({
                data: {
                    name: name,
                    title: extractedTitle,
                    bio: cleanedBio || r.mieutangan || '',
                    staffTypeId: staffType.id,
                    departmentId: currentDeptId,
                    avatar: avatarData,
                    isActive: r.is_active === 1 || r.is_active === undefined,
                    sortOrder: r.stt_hienthi || 0
                }
            });
            staffAdded++;
        }

        console.log(`\n🎉 Advisory Board Import Complete! Added ${staffAdded} staff members.`);
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
