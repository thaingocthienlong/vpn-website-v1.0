
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DATA_FILE = path.join(__dirname, '../banlanhdao.json');
const LOCAL_UPLOAD_DIR = 'C:/Users/longt/Desktop/website/old/httpdocs';
const OLD_SITE_BASE = 'https://vienphuongnam.edu.vn';

async function uploadImage(imagePath, name) {
    if (!imagePath) return null;

    let cleanPath = imagePath;
    // Handle URL encoded paths
    const decodedPath = decodeURIComponent(cleanPath);
    const localFile = path.join(LOCAL_UPLOAD_DIR, decodedPath);

    let uploadSource = null;

    try {
        await fs.access(localFile);
        console.log(`[Found Local] ${localFile}`);
        uploadSource = localFile;
    } catch (e) {
        const remoteUrl = `${OLD_SITE_BASE}${cleanPath}`;
        console.log(`[Missing Local] Trying remote: ${remoteUrl}`);
        uploadSource = remoteUrl;
    }

    if (!uploadSource) return null;

    try {
        const result = await cloudinary.uploader.upload(uploadSource, {
            folder: 'vpn/staff',
            public_id: `staff_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
            resource_type: 'image'
        });
        return result;
    } catch (error) {
        console.error(`[Upload Failed] ${error.message}`);
        return null;
    }
}

async function getStaffType(prisma, chucvu) {
    const lower = chucvu.toLowerCase();
    let typeName = 'Chuyên viên';
    let level = 3;

    if (lower.includes('viện trưởng') || lower.includes('phó giám đốc') || lower.includes('giám đốc điều hành') || lower.includes('chủ tịch')) {
        typeName = 'Ban Lãnh Đạo';
        level = 1;
    } else if (lower.includes('trưởng phòng') || lower.includes('phó phòng') || lower.includes('giám đốc trung tâm')) {
        typeName = 'Cán Bộ Quản Lý';
        level = 2;
    }

    // Upsert StaffType
    const staffType = await prisma.staffType.upsert({
        where: { id: `type_${level}` }, // Hacky ID to ensure singleton per level? No, use name or strict ID.
        // Better to check by name or create logic. 
        // Let's use findFirst first because we don't have unique name yet (schema says name not unique? wait)
        // Schema: id (uuid), name.
        create: {
            name: typeName,
            level: level,
            sortOrder: level
        },
        update: {}
    });

    // Actually upsert with non-unique field is hard.
    // Let's do findFirst then create.
    const existing = await prisma.staffType.findFirst({ where: { level } });
    if (existing) return existing;

    return await prisma.staffType.create({
        data: {
            name: typeName,
            level: level,
            sortOrder: level
        }
    });
}

function isDepartment(record) {
    if (record.chucvu && record.chucvu.trim() !== '') return false;
    const name = record.name.toLowerCase();
    return name.includes('trung tâm') || name.includes('phòng') || name.includes('khối');
}

async function main() {
    const { PrismaClient } = await import("@prisma/client");
    const { PrismaLibSql } = await import("@prisma/adapter-libsql");

    const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
    const adapter = new PrismaLibSql({ url: databaseUrl });
    const prisma = new PrismaClient({ adapter });

    try {
        console.log('🚀 Starting Staff Migration...');

        const systemUser = await prisma.user.findFirst();
        if (!systemUser) {
            console.error("❌ No users found in DB.");
            process.exit(1);
        }

        const rawData = await fs.readFile(DATA_FILE, 'utf8');
        const records = JSON.parse(rawData);

        let currentDept = null;

        for (const r of records) {
            const name = r.name.trim();
            const chucvu = r.chucvu ? r.chucvu.trim() : '';

            // Check if Department Header
            if (isDepartment(r)) {
                console.log(`\n🏢 Found Department: ${name}`);
                currentDept = await prisma.department.upsert({
                    where: { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
                    update: {},
                    create: {
                        name: name,
                        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        sortOrder: r.stt_hienthi || 0
                    }
                });
                continue;
            }

            console.log(`👤 Processing: ${name} (${chucvu})`);

            // Staff Type
            const staffType = await getStaffType(prisma, chucvu);


            // Check if exists
            const existingStaff = await prisma.staff.findFirst({ where: { name: name } });

            if (existingStaff) {
                console.log(`🔄 Updating existing Staff: ${name}`);

                // If avatar is missing in DB but exists in source, try to upload
                if (!existingStaff.avatarId && r.anhdaidien) {
                    const upload = await uploadImage(r.anhdaidien, name);
                    if (upload) {
                        const media = await prisma.media.create({
                            data: {
                                filename: path.basename(r.anhdaidien),
                                url: upload.secure_url,
                                secureUrl: upload.secure_url,
                                publicId: upload.public_id,
                                format: upload.format,
                                size: upload.bytes || 0,
                                width: upload.width,
                                height: upload.height,
                                resourceType: upload.resource_type,
                                uploadedById: systemUser.id
                            }
                        });

                        await prisma.staff.update({
                            where: { id: existingStaff.id },
                            data: { avatarId: media.id }
                        });
                        console.log(`   📸 Avatar updated for ${name}`);
                    }
                }

                // Update other fields just in case
                await prisma.staff.update({
                    where: { id: existingStaff.id },
                    data: {
                        departmentId: currentDept ? currentDept.id : existingStaff.departmentId,
                        staffTypeId: staffType.id
                    }
                });

            } else {
                // Create Logic
                let avatarId = null;
                if (r.anhdaidien) {
                    const upload = await uploadImage(r.anhdaidien, name);
                    if (upload) {
                        const media = await prisma.media.create({
                            data: {
                                filename: path.basename(r.anhdaidien),
                                url: upload.secure_url,
                                secureUrl: upload.secure_url,
                                publicId: upload.public_id,
                                format: upload.format,
                                size: upload.bytes || 0,
                                width: upload.width,
                                height: upload.height,
                                resourceType: upload.resource_type,
                                uploadedById: systemUser.id
                            }
                        });
                        avatarId = media.id;
                    }
                }

                // Create Staff
                await prisma.staff.create({
                    data: {
                        name: name,
                        title: chucvu,
                        bio: r.mieutangan || null,
                        avatarId: avatarId,
                        staffTypeId: staffType.id,
                        departmentId: currentDept ? currentDept.id : null,
                        sortOrder: r.stt_hienthi || 0,
                        isActive: true
                    }
                });
                console.log(`✅ Created Staff: ${name}`);
            }

        }

        console.log(`\n🎉 Migration Complete!`);

    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
