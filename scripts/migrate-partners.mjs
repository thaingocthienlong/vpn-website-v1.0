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

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FILES = [
    path.join(__dirname, '../database/doitac.json'),
    path.join(__dirname, '../database/donvilienket.json')
];
const LOCAL_UPLOAD_DIR = 'C:/Users/longt/Desktop/website/old';
const OLD_SITE_BASE = 'https://vienphuongnam.edu.vn';

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
        const remoteUrl = `${OLD_SITE_BASE}${cleanPath}`;
        console.log(`[Missing Local] Trying remote: ${remoteUrl}`);

        try {
            const res = await fetch(remoteUrl, { method: 'HEAD' });
            if (res.ok) {
                uploadSource = remoteUrl;
            } else {
                console.warn(`[Missing Remote] ${remoteUrl} - Status: ${res.status}`);
            }
        } catch (err) {
            console.warn(`[Error checking remote] ${err.message}`);
        }
    }

    if (!uploadSource) return null;

    try {
        const result = await cloudinary.uploader.upload(uploadSource, {
            folder: 'vpn/partners',
            public_id: `partner_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
            resource_type: 'image'
        });
        return result;
    } catch (error) {
        console.error(`[Upload Failed] ${error.message}`);
        return null;
    }
}

async function main() {
    // Dynamic import of prisma client
    const { PrismaClient } = await import("@prisma/client");
    const { PrismaLibSql } = await import("@prisma/adapter-libsql");

    const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
    const adapter = new PrismaLibSql({ url: databaseUrl });
    const prisma = new PrismaClient({ adapter });

    try {
        console.log('🚀 Starting Partners Migration (Multi-Source)...');

        const systemUser = await prisma.user.findFirst();
        if (!systemUser) {
            console.error("❌ No users found in DB. Please create a user first.");
            process.exit(1);
        }

        let processedNames = new Set(); // Track processed in this run to avoid duplicate checks if files overlap

        for (const file of FILES) {
            if (!await fs.stat(file).catch(() => false)) {
                console.warn(`⚠️ File not found: ${file}`);
                continue;
            }
            console.log(`\n📂 Processing file: ${path.basename(file)}`);

            const rawData = await fs.readFile(file, 'utf8');
            const partners = JSON.parse(rawData);

            for (const p of partners) {
                const normalizedName = p.name.trim();
                if (processedNames.has(normalizedName)) continue;
                processedNames.add(normalizedName);

                const existing = await prisma.partner.findFirst({
                    where: { name: normalizedName }
                });

                if (existing) {
                    console.log(`[Skip] Partner exists: ${normalizedName}`);
                    continue;
                }

                console.log(`Processing: ${normalizedName}`);

                // Handle Image
                let logoId = null;
                const uploadResult = await uploadImage(p.image, normalizedName);

                if (uploadResult) {
                    const media = await prisma.media.create({
                        data: {
                            filename: path.basename(p.image || 'logo.jpg'),
                            url: uploadResult.secure_url,
                            secureUrl: uploadResult.secure_url,
                            publicId: uploadResult.public_id,
                            format: uploadResult.format,
                            size: uploadResult.bytes || 0,
                            width: uploadResult.width,
                            height: uploadResult.height,
                            resourceType: uploadResult.resource_type,
                            uploadedById: systemUser.id
                        }
                    });
                    logoId = media.id;
                }

                // Create Partner
                let webUrl = p.url;
                if (webUrl === 'null' || webUrl === 'undefined') webUrl = null;

                await prisma.partner.create({
                    data: {
                        name: normalizedName,
                        website: webUrl,
                        logoId: logoId,
                        isActive: true,
                        description: p.description || null,
                        sortOrder: parseInt(p.id) || 0
                    }
                });
                console.log(`[Created] ${normalizedName}`);
            }
        }

        console.log(`\n✅ Migration Complete!`);
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
