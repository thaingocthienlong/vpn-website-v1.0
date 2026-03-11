import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env.local') });

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

// Project root
const PROJECT_ROOT = path.join(__dirname, '..');

async function uploadImage(imagePath, name) {
    if (!imagePath) return null;

    let cleanPath = decodeURIComponent(imagePath);

    // Remove leading slash to join correctly
    if (cleanPath.startsWith('/') || cleanPath.startsWith('\\')) {
        cleanPath = cleanPath.substring(1);
    }

    // Join with project root (because cleanPath includes 'uploads/...')
    const localFile = path.join(PROJECT_ROOT, cleanPath);

    try {
        await fs.access(localFile);
        // console.log(`[Found Local] ${localFile}`);
    } catch (e) {
        console.warn(`[Missing Local] ${localFile}`);
        return null;
    }

    try {
        const result = await cloudinary.uploader.upload(localFile, {
            folder: 'vpn/partners',
            public_id: `partner_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
            resource_type: 'image',
            format: 'avif'
        });
        return result;
    } catch (error) {
        console.error(`[Upload Failed] ${error.message}`);
        return null;
    }
}

async function main() {
    const { PrismaClient } = await import("@prisma/client");
    const { PrismaLibSql } = await import("@prisma/adapter-libsql");

    const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
    const adapter = new PrismaLibSql({ url: databaseUrl });
    const prisma = new PrismaClient({ adapter });

    try {
        console.log('🚀 Starting Partner Image Migration (Local -> Cloudinary AVIF)...');

        const systemUser = await prisma.user.findFirst();
        if (!systemUser) {
            console.error("❌ No users found in DB. Please create a user first.");
            process.exit(1);
        }

        let processedNames = new Set();
        let updatedCount = 0;

        for (const file of FILES) {
            if (!await fs.stat(file).catch(() => false)) continue;

            const rawData = await fs.readFile(file, 'utf8');
            const partners = JSON.parse(rawData);

            for (const p of partners) {
                // Filter garbage
                if (!p.name || p.name === 'name') continue;

                const normalizedName = p.name.trim();
                if (processedNames.has(normalizedName)) continue;
                processedNames.add(normalizedName);

                // Find partner in DB
                const partner = await prisma.partner.findFirst({
                    where: { name: normalizedName }
                });

                if (!partner) {
                    console.warn(`[Skip] Partner not found in DB: ${normalizedName}`);
                    continue;
                }

                if (partner.logoId) {
                    console.log(`[Skip] Partner already has logo: ${normalizedName}`);
                    continue;
                }

                console.log(`Processing: ${normalizedName}`);

                const uploadResult = await uploadImage(p.image, normalizedName);

                if (uploadResult) {
                    // Create Media
                    const media = await prisma.media.create({
                        data: {
                            filename: path.basename(p.image || 'logo.avif'),
                            url: uploadResult.secure_url,
                            secureUrl: uploadResult.secure_url,
                            publicId: uploadResult.public_id,
                            format: uploadResult.format,
                            size: uploadResult.bytes || 0,
                            width: uploadResult.width,
                            height: uploadResult.height,
                            resourceType: uploadResult.resource_type,
                            uploadedById: systemUser.id,
                            alt: normalizedName
                        }
                    });

                    // Update Partner
                    await prisma.partner.update({
                        where: { id: partner.id },
                        data: { logoId: media.id }
                    });
                    console.log(`[Updated] ${normalizedName} -> ${uploadResult.secure_url}`);
                    updatedCount++;
                }
            }
        }

        console.log(`\n✅ Migration Complete! Updated ${updatedCount} partners.`);
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
