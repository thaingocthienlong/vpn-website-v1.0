
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DATA_FILE = path.join(__dirname, '../bancovan.json');
const LOCAL_UPLOAD_DIR = 'C:/Users/longt/Desktop/website/old/httpdocs';

async function uploadImage(imagePath, name) {
    if (!imagePath) return null;

    let cleanPath = imagePath;
    const decodedPath = decodeURIComponent(cleanPath);
    const localFile = path.join(LOCAL_UPLOAD_DIR, decodedPath);

    let uploadSource = null;

    try {
        await fs.access(localFile);
        console.log(`[Found Local] ${localFile}`);
        uploadSource = localFile;
    } catch (e) {
        console.log(`[Missing Local] ${localFile}`);
        return null;
    }

    try {
        const result = await cloudinary.uploader.upload(uploadSource, {
            folder: 'vpn/staff',
            public_id: `advisory_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
            resource_type: 'image'
        });
        return result;
    } catch (error) {
        console.error(`[Upload Failed] ${error.message}`);
        return null;
    }
}

function extractTitle(htmlContent) {
    if (!htmlContent) return '';
    // Look for <strong>...</strong> which usually contains the title TRƯỞNG BAN, PHÓ TRƯỞNG BAN, THÀNH VIÊN
    const match = htmlContent.match(/<strong>(.*?)<\/strong>/i);
    if (match && match[1]) {
        return match[1].trim();
    }
    return '';
}

function cleanBio(htmlContent) {
    if (!htmlContent) return '';
    // Remove the <p style="..."><strong>...</strong></p> part which is the title
    let clean = htmlContent.replace(/<p[^>]*>\s*<strong>.*?<\/strong>\s*<\/p>/ig, '');
    clean = clean.replace(/<strong>.*?<\/strong>/ig, '');
    return clean.trim();
}

async function main() {
    const { PrismaClient } = await import("@prisma/client");
    const { PrismaLibSql } = await import("@prisma/adapter-libsql");

    const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
    const adapter = new PrismaLibSql({ url: databaseUrl });
    const prisma = new PrismaClient({ adapter });

    try {
        console.log('🚀 Starting Advisory Board Migration...');

        const systemUser = await prisma.user.findFirst();
        if (!systemUser) {
            console.error("❌ No users found in DB.");
            process.exit(1);
        }

        // Ensure "Hội đồng Cố vấn Khoa học" StaffType exists
        let advisoryType = await prisma.staffType.findFirst({
            where: { name: 'Hội đồng Cố vấn Khoa học' }
        });

        if (!advisoryType) {
            advisoryType = await prisma.staffType.create({
                data: {
                    name: 'Hội đồng Cố vấn Khoa học',
                    level: 2,
                    sortOrder: 2
                }
            });
        }
        console.log(`✅ StaffType Ready: ${advisoryType.name} (Level ${advisoryType.level})`);

        const rawData = await fs.readFile(DATA_FILE, 'utf8');
        let records = JSON.parse(rawData);

        // Sort by stt_hienthi just to be sure order is correct
        records.sort((a, b) => (a.stt_hienthi || 0) - (b.stt_hienthi || 0));

        let currentDept = null;

        for (const r of records) {
            const name = r.name ? r.name.trim() : '';
            if (!name) continue;

            const isHeading = !r.anhdaidien && !r.chucvu && !r.mieutangan;

            if (isHeading) {
                console.log(`\n🏢 Found Department Heading: ${name}`);
                currentDept = await prisma.department.upsert({
                    where: { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
                    create: {
                        name: name,
                        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        sortOrder: r.stt_hienthi || 0
                    },
                    update: {
                        sortOrder: r.stt_hienthi || 0
                    }
                });
                continue;
            }

            // It's a member
            let title = r.chucvu ? r.chucvu.trim() : '';
            if (!title) {
                title = extractTitle(r.mieutangan);
            }
            const bio = cleanBio(r.mieutangan);

            console.log(`👤 Processing: ${name} (${title})`);

            const existingStaff = await prisma.staff.findFirst({ where: { name: name } });

            if (existingStaff) {
                console.log(`🔄 Updating existing Staff: ${name}`);

                // Update properties
                await prisma.staff.update({
                    where: { id: existingStaff.id },
                    data: {
                        departmentId: currentDept ? currentDept.id : null,
                        staffTypeId: advisoryType.id,
                        title: title || existingStaff.title,
                        bio: bio || existingStaff.bio,
                        sortOrder: r.stt_hienthi || existingStaff.sortOrder
                    }
                });

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
                        console.log(`   📸 Avatar added for ${name}`);
                    }
                }
            } else {
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

                await prisma.staff.create({
                    data: {
                        name: name,
                        title: title,
                        bio: bio || null,
                        avatarId: avatarId,
                        staffTypeId: advisoryType.id,
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
