import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
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

async function main() {
    const { PrismaClient } = await import("@prisma/client");
    const { PrismaLibSql } = await import("@prisma/adapter-libsql");

    const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
    const adapter = new PrismaLibSql({ url: databaseUrl });
    const prisma = new PrismaClient({ adapter });

    console.log("🚀 Starting Cloudinary Avatar Recovery...");

    try {
        const systemUser = await prisma.user.findFirst();
        if (!systemUser) throw new Error('No user found');

        // Fetch existing staff members
        const staffList = await prisma.staff.findMany({
            include: { avatar: true }
        });

        console.log(`👤 Found ${staffList.length} staff records in DB.`);

        // Fetch all assets from vpn/staff using the Admin API
        // since we might have hundreds, we'll fetch all using next_cursor if needed
        let assets = [];
        let next_cursor = null;

        console.log('☁️ Fetching assets from Cloudinary vpn/staff...');
        do {
            const fetchOptions = {
                type: 'upload',
                prefix: 'vpn/staff',
                max_results: 500
            };
            if (next_cursor) fetchOptions.next_cursor = next_cursor;

            const res = await cloudinary.api.resources(fetchOptions);
            assets = assets.concat(res.resources);
            next_cursor = res.next_cursor;
        } while (next_cursor);

        console.log(`🖼️ Found ${assets.length} images on Cloudinary.`);

        let recovered = 0;

        for (const staff of staffList) {
            // we uploaded with names like `staff_nguyen_van_a_12345`
            // Let's generate a normalized matching string from the DB staff name
            const normalizedName = staff.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

            // Look for matching image
            // We'll check if any public_id contains normalizedName
            const staffMatchStr = `staff_${normalizedName}`;
            const advisoryMatchStr = `advisory_${normalizedName}`;

            const match = assets.find(a =>
                a.public_id === `vpn/staff/${staffMatchStr}` ||
                a.public_id.includes(`${staffMatchStr}_`) ||
                a.public_id === `vpn/staff/${advisoryMatchStr}` ||
                a.public_id.includes(`${advisoryMatchStr}_`)
            );

            if (match) {
                // Determine format
                const secureUrl = match.secure_url;
                // If the URL is already an AVIF or ends in .avif, that's what we want.
                // Cloudinary fetch actually returns the canonical uploaded file extension in secure_url, or we can force it.
                // Normally it is .avif if we converted it, but let's just use secure_url as is.

                if (staff.avatar?.url === secureUrl) {
                    continue; // Already assigned correctly
                }

                console.log(`✅ Match found for ${staff.name}: ${secureUrl}`);

                // Build a file record if we have to replace broken ones
                if (!staff.avatarId || (staff.avatar && staff.avatar.url !== secureUrl)) {
                    // Create new file record
                    const fileRecord = await prisma.media.create({
                        data: {
                            filename: match.public_id.split('/').pop() + '.' + match.format,
                            url: secureUrl,
                            size: match.bytes,
                            mimeType: `image/${match.format}`,
                            uploadedById: systemUser.id
                        }
                    });

                    // Update staff
                    await prisma.staff.update({
                        where: { id: staff.id },
                        data: { avatarId: fileRecord.id }
                    });

                    recovered++;
                }
            } else {
                console.log(`❌ No Cloudinary match found for: ${staff.name} (searched for 'staff_${normalizedName}')`);
            }
        }

        console.log(`\n🎉 Recovery Complete! Recovered ${recovered} avatars.`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
