/**
 * migrate-from-json.ts
 *
 * Comprehensive data migration from sql_json_export/ JSON files into the new Prisma SQLite database.
 *
 * Usage:
 *   npx ts-node --project scripts/tsconfig.json scripts/migrate-from-json.ts
 *   npx ts-node --project scripts/tsconfig.json scripts/migrate-from-json.ts --dry-run
 *   npx ts-node --project scripts/tsconfig.json scripts/migrate-from-json.ts --phase users
 *
 * Options:
 *   --dry-run   Validate data without writing to DB
 *   --phase     Run only a specific phase: users | categories | clear-categories | tags | staff | partners | posts | courses | pages | config | menus | videos | services | gallery | all
 *   --wipe      Wipe all migrated data before starting (dangerous!)
 */

import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import * as bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// ─── DB Setup ─────────────────────────────────────────────────────────────────
const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

// ─── Paths ────────────────────────────────────────────────────────────────────
const JSON_DIR = path.resolve(__dirname, "../../sql_json_export");

function readJson<T>(filename: string): T {
  const fp = path.join(JSON_DIR, filename);
  if (!fs.existsSync(fp)) {
    console.warn(`  ⚠  File not found: ${fp} — returning empty array`);
    return [] as unknown as T;
  }
  return JSON.parse(fs.readFileSync(fp, "utf-8")) as T;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .replace(/^-|-$/g, "");
}

function uniqueSlug(base: string, existing: Set<string>): string {
  let slug = base;
  let i = 1;
  while (existing.has(slug)) {
    slug = `${base}-${i++}`;
  }
  existing.add(slug);
  return slug;
}

function mediaFilename(url: string): string {
  try {
    return decodeURIComponent(url.split("/").pop() || "image.jpg");
  } catch {
    return "image.jpg";
  }
}

function guessMime(url: string): string {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp", avif: "image/avif",
    svg: "image/svg+xml",
  };
  return map[ext] || "image/jpeg";
}

function cleanContent(html: string): string {
  if (!html) return "";
  return html
    .replace(/\\r\\n/g, "\r\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\\/g, "\\");
}

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\\r\\n|\\r|\\n/g, " ")
    .replace(/\r\n|\r|\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function youtubeToEmbed(url: string): string {
  if (!url) return url;
  // youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  // youtube.com/watch?v=VIDEO_ID
  const longMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;
  // Already embed or other format
  return url;
}

// ─── ID Maps ──────────────────────────────────────────────────────────────────
const idMaps = {
  users: new Map<string, string>(),         // old id → new uuid
  categories: new Map<string, string>(),    // "post_{id}" | "course_{id}" → new uuid
  tags: new Map<string, string>(),          // slug → new uuid
  departments: new Map<string, string>(),   // "banlanhdao" | "bancovan" → new uuid
  staffTypes: new Map<string, string>(),    // level key → new uuid
  media: new Map<string, string>(),         // url → new media uuid
  posts: new Map<string, string>(),         // old id → new uuid
  courses: new Map<string, string>(),       // old id → new uuid
  partners: new Map<string, string>(),      // old id → new uuid
  staff: new Map<string, string>(),         // old id → new uuid
};

let adminUserId = "";

// ─── Parse CLI args ───────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const WIPE = args.includes("--wipe");
const phaseArg = (() => {
  const idx = args.indexOf("--phase");
  return idx !== -1 ? args[idx + 1] : "all";
})();

const runPhase = (name: string) =>
  phaseArg === "all" || phaseArg === name;

// ─── Media helper ─────────────────────────────────────────────────────────────
async function ensureMedia(url: string, altText: string = ""): Promise<string | null> {
  if (!url || !url.trim()) return null;
  if (idMaps.media.has(url)) return idMaps.media.get(url)!;

  if (!DRY_RUN) {
    const media = await prisma.media.create({
      data: {
        url,
        filename: mediaFilename(url),
        mimeType: guessMime(url),
        size: 0,
        alt: altText || null,
        uploadedById: adminUserId,
      },
    });
    idMaps.media.set(url, media.id);
    return media.id;
  }
  return `dry-run-media-id`;
}

// ─── WIPE ─────────────────────────────────────────────────────────────────────
async function wipeAll() {
  console.log("⚠  Wiping all migrated data...");
  await prisma.postTag.deleteMany({});
  await prisma.contentSection.deleteMany({});
  await prisma.coursePartner.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.page.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.partner.deleteMany({});
  await prisma.media.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.staffType.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.configuration.deleteMany({});
  await prisma.user.deleteMany({ where: { NOT: { email: "system@sisrd.vn" } } });
  console.log("✓  Wiped.\n");
}

// ─── PHASE 1: Users ───────────────────────────────────────────────────────────
async function migrateUsers() {
  if (!runPhase("users")) return;
  console.log("\n── Phase 1: Users ──");

  interface OldUser {
    id: string | number;
    username: string;
    fullname: string;
    password: string;
    phanquyen: string | number;
    avatar?: string;
  }

  // Always ensure system user first
  let sysUser = await prisma.user.findFirst({ where: { email: "system@sisrd.vn" } });
  if (!sysUser && !DRY_RUN) {
    sysUser = await prisma.user.create({
      data: {
        email: "system@sisrd.vn",
        name: "System",
        password: await bcrypt.hash("ChangeMe@2024!", 10),
        role: "SUPER_ADMIN",
        isActive: false,
      },
    });
    console.log("  ✓ Created system user");
  }
  adminUserId = sysUser?.id || "system-user-id";

  const users = readJson<OldUser[]>("user.json");
  let ok = 0, skip = 0;

  for (const u of users) {
    const email = String(u.username).includes("@")
      ? u.username
      : `${u.username}@sisrd.vn`;
    const role = String(u.phanquyen) === "1" ? "SUPER_ADMIN" : "CONTENT_EDITOR";
    // Generate bcrypt temp password (not MD5)
    const tempPwd = await bcrypt.hash("ViPhuongNam@Reset2024", 10);

    try {
      const existing = await prisma.user.findFirst({ where: { email } });
      if (existing) {
        idMaps.users.set(String(u.id), existing.id);
        skip++;
        continue;
      }
      if (!DRY_RUN) {
        const nu = await prisma.user.create({
          data: {
            email,
            name: u.fullname || u.username,
            password: tempPwd,
            role,
            avatar: u.avatar || null,
            isActive: false, // require password reset
          },
        });
        idMaps.users.set(String(u.id), nu.id);
        // First real admin = default author
        if (role === "SUPER_ADMIN" && !adminUserId.startsWith("system")) {
          adminUserId = nu.id;
        }
      }
      ok++;
    } catch (e: any) {
      console.error(`  ✗ User ${u.username}: ${e.message}`);
      skip++;
    }
  }

  // If adminUserId still system, try to find any admin
  if (adminUserId === "system-user-id" || adminUserId === sysUser?.id) {
    const admin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
    if (admin) adminUserId = admin.id;
  }

  console.log(`  Users: ${ok} created, ${skip} skipped. Admin: ${adminUserId}`);
}

// ─── PHASE 2: Categories ──────────────────────────────────────────────────────
async function migrateCategories() {
  if (!runPhase("categories")) return;
  console.log("\n── Phase 2: Categories ──");

  interface OldCategory {
    id: string | number;
    tenchuyenmuc: string;
    duongdan: string;
    trangthai?: string | number;
    mieutangan?: string;
    stt_hienthi?: string | number;
  }

  const postCats = readJson<OldCategory[]>("category_post.json");
  const courseCats = readJson<OldCategory[]>("category_service.json");

  const slugsUsed = new Set<string>();
  let ok = 0, skip = 0;

  async function upsertCategory(cat: OldCategory, type: "POST" | "COURSE") {
    const mapKey = `${type.toLowerCase()}_${cat.id}`;
    let slug = cat.duongdan?.trim() || slugify(cat.tenchuyenmuc);
    if (!slug) slug = slugify(cat.tenchuyenmuc);
    slug = uniqueSlug(slug, slugsUsed);

    try {
      const existing = await prisma.category.findFirst({
        where: { slug },
      });
      if (existing) {
        idMaps.categories.set(mapKey, existing.id);
        skip++;
        return;
      }
      if (!DRY_RUN) {
        const nc = await prisma.category.create({
          data: {
            name: cat.tenchuyenmuc,
            slug,
            type,
            isActive: String(cat.trangthai ?? "1") !== "0",
            description: cat.mieutangan ? stripHtml(cat.mieutangan) : null,
            sortOrder: parseInt(String(cat.stt_hienthi || "0")) || 0,
          },
        });
        idMaps.categories.set(mapKey, nc.id);
      }
      ok++;
    } catch (e: any) {
      console.error(`  ✗ Category ${cat.tenchuyenmuc}: ${e.message}`);
    }
  }

  for (const c of postCats) await upsertCategory(c, "POST");
  for (const c of courseCats) await upsertCategory(c, "COURSE");

  console.log(`  Categories: ${ok} created, ${skip} skipped`);
}

// ─── PHASE 3: Tags ────────────────────────────────────────────────────────────
async function migrateTags() {
  if (!runPhase("tags")) return;
  console.log("\n── Phase 3: Tags (from detail_tags.json) ──");

  interface OldTag {
    id: string | number;
    tukhoa: string;
    duongdan?: string;
  }

  const tags = readJson<OldTag[]>("detail_tags.json");
  const slugsUsed = new Set<string>();
  let ok = 0, skip = 0;

  for (const t of tags) {
    const name = t.tukhoa?.trim();
    if (!name || name === "Từ khóa 1" || name.startsWith("Từ khóa ")) {
      // Skip placeholder tags
      skip++;
      continue;
    }
    const slug = uniqueSlug(slugify(name), slugsUsed);

    try {
      const existing = await prisma.tag.findFirst({ where: { name } });
      if (existing) {
        idMaps.tags.set(slug, existing.id);
        skip++;
        continue;
      }
      if (!DRY_RUN) {
        const nt = await prisma.tag.create({ data: { name, slug } });
        idMaps.tags.set(slug, nt.id);
      }
      ok++;
    } catch (e: any) {
      console.error(`  ✗ Tag ${name}: ${e.message}`);
    }
  }

  console.log(`  Tags: ${ok} created, ${skip} skipped`);
}

// ─── PHASE 4: Departments + StaffTypes ───────────────────────────────────────
async function migrateStaffFoundation() {
  if (!runPhase("staff") && !runPhase("all")) return;
  if (!runPhase("staff") && phaseArg !== "all") return;
  console.log("\n── Phase 4: Departments + StaffTypes ──");

  const depts = [
    { key: "banlanhdao", name: "Ban Lãnh Đạo Viện", slug: "ban-lanh-dao-vien", sortOrder: 1 },
    { key: "bancovan", name: "Ban Cố Vấn", slug: "ban-co-van", sortOrder: 2 },
  ];

  for (const d of depts) {
    const existing = await prisma.department.findFirst({ where: { slug: d.slug } });
    if (existing) {
      idMaps.departments.set(d.key, existing.id);
    } else if (!DRY_RUN) {
      const nd = await prisma.department.create({
        data: { name: d.name, slug: d.slug, sortOrder: d.sortOrder, isActive: true },
      });
      idMaps.departments.set(d.key, nd.id);
    }
  }

  // StaffTypes by title keyword
  const staffTypesDef = [
    { key: "vientruong", name: "Viện Trưởng", level: 1, sortOrder: 1, isAdvisory: false },
    { key: "phochuyenvien", name: "Phó Viện Trưởng", level: 2, sortOrder: 2, isAdvisory: false },
    { key: "uvtv", name: "Ủy Viên / Thành Viên", level: 3, sortOrder: 3, isAdvisory: false },
    { key: "covan", name: "Cố Vấn", level: 4, sortOrder: 4, isAdvisory: true },
    { key: "nhanvien", name: "Nhân Viên", level: 5, sortOrder: 5, isAdvisory: false },
  ];

  for (const st of staffTypesDef) {
    const existing = await prisma.staffType.findFirst({ where: { name: st.name } });
    if (existing) {
      idMaps.staffTypes.set(st.key, existing.id);
    } else if (!DRY_RUN) {
      const nst = await prisma.staffType.create({
        data: { name: st.name, level: st.level, sortOrder: st.sortOrder, isAdvisory: st.isAdvisory },
      });
      idMaps.staffTypes.set(st.key, nst.id);
    }
  }

  console.log(`  Departments: ${depts.length}, StaffTypes: ${staffTypesDef.length}`);
}

function resolveStaffType(chucvu: string): string {
  const cv = (chucvu || "").toLowerCase();
  if (cv.includes("viện trưởng") && !cv.includes("phó")) return idMaps.staffTypes.get("vientruong") || "";
  if (cv.includes("phó viện trưởng") || cv.includes("pho vien truong")) return idMaps.staffTypes.get("phochuyenvien") || "";
  if (cv.includes("cố vấn") || cv.includes("co van")) return idMaps.staffTypes.get("covan") || "";
  if (cv.includes("ủy viên") || cv.includes("thành viên") || cv.includes("uy vien")) return idMaps.staffTypes.get("uvtv") || "";
  return idMaps.staffTypes.get("nhanvien") || "";
}

// ─── PHASE 5: Partners ────────────────────────────────────────────────────────
async function migratePartners() {
  if (!runPhase("partners")) return;
  console.log("\n── Phase 5: Partners ──");

  interface OldPartner {
    id: string | number;
    name: string;
    anhdaidien?: string;
    duongdan?: string;
    mieutangan?: string;
  }

  const partners = readJson<OldPartner[]>("doitac.json");
  let ok = 0, skip = 0;

  for (const p of partners) {
    try {
      const existing = await prisma.partner.findFirst({ where: { name: p.name } });
      if (existing) {
        idMaps.partners.set(String(p.id), existing.id);
        skip++;
        continue;
      }

      const logoId = await ensureMedia(p.anhdaidien || "", p.name);

      if (!DRY_RUN) {
        const np = await prisma.partner.create({
          data: {
            name: p.name,
            website: p.duongdan?.startsWith("http") ? p.duongdan : null,
            logoId,
            description: p.mieutangan ? stripHtml(p.mieutangan) : null,
            isActive: true,
            sortOrder: ok,
          },
        });
        idMaps.partners.set(String(p.id), np.id);
      }
      ok++;
    } catch (e: any) {
      console.error(`  ✗ Partner ${p.name}: ${e.message}`);
    }
  }

  console.log(`  Partners: ${ok} created, ${skip} skipped`);
}

// ─── PHASE 6: Staff ───────────────────────────────────────────────────────────
async function migrateStaff() {
  if (!runPhase("staff")) return;
  console.log("\n── Phase 6: Staff ──");
  await migrateStaffFoundation();

  interface OldStaff {
    id: string | number;
    name: string;
    chucvu?: string;
    mieutangan?: string;
    anhdaidien?: string;
    stt_hienthi?: string | number;
    xuongdong?: string | number;
    email?: string;
    dienthoai?: string;
  }

  const blDaoRaw = readJson<OldStaff[]>("banlanhdao.json");
  const bCoVanRaw = readJson<OldStaff[]>("bancovan.json");

  const sources = [
    { records: blDaoRaw, deptKey: "banlanhdao" },
    { records: bCoVanRaw, deptKey: "bancovan" },
  ];

  let ok = 0, skip = 0;

  for (const { records, deptKey } of sources) {
    const deptId = idMaps.departments.get(deptKey) || null;

    for (const s of records) {
      if (!s.name?.trim()) { skip++; continue; }

      try {
        const existing = await prisma.staff.findFirst({ where: { name: s.name } });
        if (existing) {
          idMaps.staff.set(String(s.id), existing.id);
          skip++;
          continue;
        }

        const avatarId = await ensureMedia(s.anhdaidien || "", s.name);
        const staffTypeId = resolveStaffType(s.chucvu || "") || idMaps.staffTypes.get("nhanvien") || "";

        if (!staffTypeId && !DRY_RUN) {
          console.warn(`  ⚠ No staffTypeId for ${s.name} (${s.chucvu}), using fallback`);
        }

        if (!DRY_RUN && staffTypeId) {
          const ns = await prisma.staff.create({
            data: {
              name: s.name.trim(),
              title: s.chucvu?.trim() || null,
              bio: s.mieutangan ? cleanContent(s.mieutangan) : null,
              avatarId,
              departmentId: deptId,
              staffTypeId,
              sortOrder: parseInt(String(s.stt_hienthi || "0")) || ok,
              isActive: String(s.xuongdong ?? "1") !== "0",
              email: s.email?.trim() || null,
              phone: s.dienthoai?.trim() || null,
            },
          });
          idMaps.staff.set(String(s.id), ns.id);
        }
        ok++;
      } catch (e: any) {
        console.error(`  ✗ Staff ${s.name}: ${e.message}`);
        skip++;
      }
    }
  }

  console.log(`  Staff: ${ok} created, ${skip} skipped`);
}

// ─── PHASE 7: Posts ───────────────────────────────────────────────────────────
async function migratePosts() {
  if (!runPhase("posts")) return;
  console.log("\n── Phase 7: Posts ──");

  interface OldPost {
    id: string | number;
    id_chuyenmuc: string | number;
    tieude: string;
    tieudeseo?: string;
    duongdan: string;
    mieutangan?: string;
    mieutachitiet?: string;
    mieutaseo?: string;
    tukhoa?: string;
    anhdaidien?: string;
    noibat?: string | number;
    ngayvietbai?: string;
    luotxem?: string | number;
    luunhap?: string | number;
    kiemduyenoidung?: string | number;
  }

  const posts = readJson<OldPost[]>("post.json");
  const slugsUsed = new Set<string>();

  // Pre-load existing slugs
  const existingSlugs = await prisma.post.findMany({ select: { slug: true } });
  existingSlugs.forEach(p => slugsUsed.add(p.slug));

  let ok = 0, skip = 0, tagLinksCreated = 0;

  for (const p of posts) {
    if (!p.tieude?.trim()) { skip++; continue; }

    let slug = p.duongdan?.trim() || slugify(p.tieude);
    slug = uniqueSlug(slug, slugsUsed);

    const catId = idMaps.categories.get(`post_${p.id_chuyenmuc}`) || null;
    const isPublished = parseInt(String(p.luunhap || "0")) === 0;
    const publishedAt = p.ngayvietbai ? new Date(p.ngayvietbai) : new Date();

    try {
      const existing = await prisma.post.findFirst({ where: { OR: [
        { slug: p.duongdan?.trim() || "" },
        { title: p.tieude.trim() }
      ]}});
      if (existing) {
        idMaps.posts.set(String(p.id), existing.id);
        skip++;
        continue;
      }

      if (!catId && !DRY_RUN) {
        console.warn(`  ⚠ Post "${p.tieude}" has unknown category ${p.id_chuyenmuc}, skipping`);
        skip++;
        continue;
      }

      const featImgId = await ensureMedia(p.anhdaidien || "", p.tieude);

      let postId: string | null = null;
      if (!DRY_RUN) {
        const np = await prisma.post.create({
          data: {
            title: p.tieude.trim(),
            slug,
            excerpt: stripHtml(p.mieutangan || "") || null,
            content: cleanContent(p.mieutachitiet || "") || "",
            categoryId: catId!,
            authorId: adminUserId,
            type: "ORIGINAL",
            isFeatured: parseInt(String(p.noibat || "0")) === 1,
            isPublished,
            publishedAt: isPublished ? publishedAt : null,
            viewCount: parseInt(String(p.luotxem || "0")) || 0,
            featuredImageId: featImgId,
            metaTitle: p.tieudeseo?.trim() || null,
            metaDescription: p.mieutaseo?.trim() || null,
          },
        });
        postId = np.id;
        idMaps.posts.set(String(p.id), np.id);
      }

      // Handle PostTags from tukhoa field (comma-separated keywords)
      if (p.tukhoa?.trim() && postId) {
        const keywords = p.tukhoa.split(",").map(k => k.trim()).filter(k => k.length > 0 && k.length < 100);
        for (const kw of keywords) {
          const tagSlug = slugify(kw);
          if (!tagSlug) continue;

          let tagId = idMaps.tags.get(tagSlug);
          if (!tagId && !DRY_RUN) {
            const exTag = await prisma.tag.findFirst({ where: { name: kw } });
            if (exTag) {
              tagId = exTag.id;
            } else {
              try {
                const nt = await prisma.tag.create({ data: { name: kw, slug: tagSlug } });
                tagId = nt.id;
              } catch {
                const fallback = await prisma.tag.findFirst({ where: { slug: tagSlug } });
                tagId = fallback?.id;
              }
            }
            if (tagId) idMaps.tags.set(tagSlug, tagId);
          }

          if (tagId && postId && !DRY_RUN) {
            try {
              await prisma.postTag.create({ data: { postId, tagId } });
              tagLinksCreated++;
            } catch {
              // Already linked, skip
            }
          }
        }
      }

      ok++;
    } catch (e: any) {
      console.error(`  ✗ Post "${p.tieude}": ${e.message}`);
      skip++;
    }
  }

  console.log(`  Posts: ${ok} created, ${skip} skipped, ${tagLinksCreated} tag links`);
}

// ─── PHASE 8: Courses (from hosomoitruong.json) ───────────────────────────────
async function migrateCourses() {
  if (!runPhase("courses")) return;
  console.log("\n── Phase 8: Courses (from hosomoitruong.json) ──");

  // First: delete old TRAINING-type courses that came from service.json
  if (!DRY_RUN) {
    const oldCourses = await prisma.course.findMany({ where: { type: "TRAINING" }, select: { id: true } });
    if (oldCourses.length > 0) {
      const ids = oldCourses.map(c => c.id);
      await prisma.contentSection.deleteMany({ where: { entityType: "COURSE", entityId: { in: ids } } });
      await prisma.coursePartner.deleteMany({ where: { courseId: { in: ids } } });
      await prisma.course.deleteMany({ where: { id: { in: ids } } });
      console.log(`  Deleted ${oldCourses.length} old TRAINING courses from service.json`);
    }
  }

  interface OldCourse {
    id: string | number;
    id_chuyenmuc?: string | number;
    tieude: string;
    tieudeseo?: string;
    duongdan: string;
    mieutangan?: string;
    mieutachitiet?: string;
    mieutaseo?: string;
    anhdaidien?: string;
    noibat?: string | number;
    created_time?: string;
    luotxem?: string | number;
    luunhap?: string | number;
    stt_hienthi?: string | number;
    // Tab content fields
    t1?: string; c1?: string;
    t2?: string; c2?: string;
    t3?: string; c3?: string;
    t4?: string; c4?: string;
    t5?: string; c5?: string;
    t6?: string; c6?: string;
    t7?: string; c7?: string;
    t8?: string; c8?: string;
    t9?: string; c9?: string;
    t10?: string; c10?: string;
  }

  const courses = readJson<OldCourse[]>("hosomoitruong.json");
  const slugsUsed = new Set<string>();
  const existSlugs = await prisma.course.findMany({ select: { slug: true } });
  existSlugs.forEach(c => slugsUsed.add(c.slug));

  let ok = 0, skip = 0, sections = 0;

  for (const s of courses) {
    if (!s.tieude?.trim()) { skip++; continue; }

    let slug = s.duongdan?.trim() || slugify(s.tieude);
    if (!slug) slug = slugify(s.tieude);
    slug = uniqueSlug(slug, slugsUsed);

    const catId = s.id_chuyenmuc
      ? (idMaps.categories.get(`course_${s.id_chuyenmuc}`) || null)
      : null;
    const isPublished = parseInt(String(s.luunhap || "0")) === 0;

    let publishedAt: Date | null = null;
    if (isPublished && s.created_time) {
      const parsed = new Date(s.created_time);
      publishedAt = isNaN(parsed.getTime()) ? new Date() : parsed;
    } else if (isPublished) {
      publishedAt = new Date();
    }

    try {
      const existing = await prisma.course.findFirst({ where: { slug: s.duongdan?.trim() || slug } });
      if (existing) {
        idMaps.courses.set(String(s.id), existing.id);
        skip++;
        continue;
      }

      const featImgId = await ensureMedia(s.anhdaidien || "", s.tieude);

      let courseId: string | null = null;
      if (!DRY_RUN) {
        const nc = await prisma.course.create({
          data: {
            title: s.tieude.trim(),
            slug,
            excerpt: stripHtml(s.mieutangan || "") || null,
            categoryId: catId,
            authorId: adminUserId,
            type: "TRAINING",
            isFeatured: parseInt(String(s.noibat || "0")) === 1,
            isPublished,
            publishedAt,
            viewCount: parseInt(String(s.luotxem || "0")) || 0,
            featuredImageId: featImgId,
            metaTitle: s.tieudeseo?.trim() || null,
            metaDescription: s.mieutaseo?.trim() || null,
            sortOrder: parseInt(String(s.stt_hienthi || "0")) || ok,
          },
        });
        courseId = nc.id;
        idMaps.courses.set(String(s.id), nc.id);
      }

      if (courseId && !DRY_RUN) {
        // Main description section
        if (s.mieutachitiet?.trim()) {
          await prisma.contentSection.create({
            data: {
              entityType: "COURSE",
              entityId: courseId,
              sectionKey: "main",
              title: "Mô tả chi tiết",
              content: cleanContent(s.mieutachitiet),
              sortOrder: 0,
              isActive: true,
            },
          });
          sections++;
        }

        // Tab sections (t1-t10 / c1-c10)
        const tabs = [
          { key: "tab_1",  title: s.t1,  content: s.c1  },
          { key: "tab_2",  title: s.t2,  content: s.c2  },
          { key: "tab_3",  title: s.t3,  content: s.c3  },
          { key: "tab_4",  title: s.t4,  content: s.c4  },
          { key: "tab_5",  title: s.t5,  content: s.c5  },
          { key: "tab_6",  title: s.t6,  content: s.c6  },
          { key: "tab_7",  title: s.t7,  content: s.c7  },
          { key: "tab_8",  title: s.t8,  content: s.c8  },
          { key: "tab_9",  title: s.t9,  content: s.c9  },
          { key: "tab_10", title: s.t10, content: s.c10 },
        ];

        for (let i = 0; i < tabs.length; i++) {
          const tab = tabs[i];
          if (!tab.title?.trim() && !tab.content?.trim()) continue;
          await prisma.contentSection.create({
            data: {
              entityType: "COURSE",
              entityId: courseId,
              sectionKey: tab.key,
              title: tab.title?.trim() || tab.key,
              content: cleanContent(tab.content || ""),
              sortOrder: i + 1,
              isActive: true,
            },
          });
          sections++;
        }
      }

      ok++;
    } catch (e: any) {
      console.error(`  ✗ Course "${s.tieude}": ${e.message}`);
      skip++;
    }
  }

  console.log(`  Courses: ${ok} created, ${skip} skipped, ${sections} content sections`);
}

// ─── PHASE 9: Pages ───────────────────────────────────────────────────────────
async function migratePages() {
  if (!runPhase("pages")) return;
  console.log("\n── Phase 9: Pages ──");

  interface OldPage {
    id?: string | number;
    slug?: string;
    duongdan?: string;
    ten?: string;
    tieude?: string;
    noidung?: string;
    content?: string;
    anhdaidien?: string;
    trangthai?: string | number;
    stt_hienthi?: string | number;
  }

  const pages = readJson<OldPage[]>("page_all.json");
  const slugsUsed = new Set<string>();
  const existSlugs = await prisma.page.findMany({ select: { slug: true } });
  existSlugs.forEach(p => slugsUsed.add(p.slug));

  let ok = 0, skip = 0;

  for (const p of pages) {
    const title = (p.tieude || p.ten || "").trim();
    if (!title) { skip++; continue; }

    const rawSlug = p.slug || p.duongdan || slugify(title);
    const slug = uniqueSlug(rawSlug, slugsUsed);
    const content = cleanContent(p.noidung || p.content || "");

    try {
      const existing = await prisma.page.findFirst({ where: { slug: rawSlug } });
      if (existing) { skip++; continue; }

      const featImgId = await ensureMedia(p.anhdaidien || "", title);

      if (!DRY_RUN) {
        await prisma.page.create({
          data: {
            title,
            slug,
            content: content || "",
            authorId: adminUserId,
            isPublished: String(p.trangthai ?? "1") !== "0",
            featuredImageId: featImgId,
            sortOrder: parseInt(String(p.stt_hienthi || "0")) || ok,
          },
        });
      }
      ok++;
    } catch (e: any) {
      console.error(`  ✗ Page "${title}": ${e.message}`);
      skip++;
    }
  }

  console.log(`  Pages: ${ok} created, ${skip} skipped`);
}

// ─── PHASE 10: Configurations ─────────────────────────────────────────────────
async function migrateConfigurations() {
  if (!runPhase("config")) return;
  console.log("\n── Phase 10: Configurations ──");

  interface OldConfig {
    ten?: string;
    key?: string;
    giatri?: string;
    value?: string;
    nhom?: string;
    group?: string;
  }

  const configs1 = readJson<OldConfig[]>("configurations.json");
  const configs2 = readJson<OldConfig[]>("info_website.json");
  const allConfigs = [...configs1, ...configs2];

  let ok = 0, skip = 0;
  const keysUsed = new Set<string>();

  for (const c of allConfigs) {
    const key = (c.key || c.ten || "").trim();
    const value = (c.value || c.giatri || "").trim();
    if (!key || keysUsed.has(key)) { skip++; continue; }
    keysUsed.add(key);

    try {
      const existing = await prisma.configuration.findFirst({ where: { key } });
      if (existing) { skip++; continue; }

      if (!DRY_RUN) {
        await prisma.configuration.create({
          data: {
            key,
            value,
            group: c.nhom || c.group || "general",
          },
        });
      }
      ok++;
    } catch (e: any) {
      console.error(`  ✗ Config ${key}: ${e.message}`);
    }
  }

  console.log(`  Configurations: ${ok} created, ${skip} skipped`);
}

// ─── PHASE 11: Menu Items ─────────────────────────────────────────────────────
async function migrateMenuItems() {
  if (!runPhase("menus")) return;
  console.log("\n── Phase 11: Menu Items ──");

  interface OldMenuItem {
    id: string | number;
    tenmenu?: string;
    label?: string;
    url?: string;
    id_cha?: string | number;
    hien_thi_menu_con?: string | number;
    stt_hienthi?: string | number;
    trangthai?: string | number;
  }

  const mainMenu = readJson<OldMenuItem[]>("menu.json");
  const footer1 = readJson<OldMenuItem[]>("menufooter.json");
  const footer2 = readJson<OldMenuItem[]>("menufooter2.json");
  const footer3 = readJson<OldMenuItem[]>("menufooter3.json");
  const footer4 = readJson<OldMenuItem[]>("menufooter4.json");

  const sources = [
    { items: mainMenu, locale: "vi", group: "main" },
    { items: footer1, locale: "vi", group: "footer1" },
    { items: footer2, locale: "vi", group: "footer2" },
    { items: footer3, locale: "vi", group: "footer3" },
    { items: footer4, locale: "vi", group: "footer4" },
  ];

  let ok = 0, skip = 0;

  for (const { items, locale } of sources) {
    for (const item of items) {
      const label = (item.tenmenu || item.label || "").trim();
      if (!label) { skip++; continue; }

      const url = (item.url || "#").trim();

      try {
        if (!DRY_RUN) {
          await prisma.menuItem.create({
            data: {
              label,
              url,
              locale,
              sortOrder: parseInt(String(item.stt_hienthi || "0")) || ok,
              isActive: String(item.trangthai ?? "1") !== "0",
            },
          });
        }
        ok++;
      } catch (e: any) {
        skip++;
      }
    }
  }

  console.log(`  Menu items: ${ok} created, ${skip} skipped`);
}

// ─── PHASE 12: Videos ──────────────────────────────────────────────────────
async function migrateVideos() {
  if (!runPhase("videos")) return;
  console.log("\n── Phase 12: Videos ──");

  interface OldVideo {
    id: string | number;
    anhdaidien?: string;
    tieude: string;
    duongdan: string;
    noibat?: string | number;
  }

  const videos = readJson<OldVideo[]>("video.json");
  let ok = 0, skip = 0;

  for (const v of videos) {
    if (!v.tieude?.trim()) { skip++; continue; }

    const embedUrl = youtubeToEmbed(v.duongdan || "");

    try {
      const existing = await prisma.video.findFirst({ where: { title: v.tieude.trim() } });
      if (existing) { skip++; continue; }

      if (!DRY_RUN) {
        await prisma.video.create({
          data: {
            title: v.tieude.trim(),
            thumbnailUrl: v.anhdaidien || null,
            videoUrl: embedUrl,
            isFeatured: parseInt(String(v.noibat || "0")) === 1,
            sortOrder: ok,
            isActive: true,
          },
        });
      }
      ok++;
    } catch (e: any) {
      console.error(`  ✗ Video "${v.tieude}": ${e.message}`);
      skip++;
    }
  }

  console.log(`  Videos: ${ok} created, ${skip} skipped`);
}

// ─── PHASE 13: Services (from service.json) ───────────────────────────────────
async function migrateServices() {
  if (!runPhase("services")) return;
  console.log("\n── Phase 13: Services (from service.json) ──");

  interface OldServiceItem {
    id: string | number;
    tieude: string;
    tieudeseo?: string;
    duongdan: string;
    mieutangan?: string;
    mieutaseo?: string;
    anhdaidien?: string;
    noibat?: string | number;
    luotxem?: string | number;
    stt_hienthi?: string | number;
  }

  const services = readJson<OldServiceItem[]>("service.json");
  const slugsUsed = new Set<string>();
  const existSlugs = await prisma.service.findMany({ select: { slug: true } });
  existSlugs.forEach(s => slugsUsed.add(s.slug));

  let ok = 0, skip = 0;

  for (const s of services) {
    if (!s.tieude?.trim()) { skip++; continue; }

    let slug = s.duongdan?.trim() || slugify(s.tieude);
    if (!slug) slug = slugify(s.tieude);
    slug = uniqueSlug(slug, slugsUsed);

    try {
      const existing = await prisma.service.findFirst({ where: { slug: s.duongdan?.trim() || slug } });
      if (existing) { skip++; continue; }

      if (!DRY_RUN) {
        await prisma.service.create({
          data: {
            title: s.tieude.trim(),
            slug,
            excerpt: stripHtml(s.mieutangan || "") || null,
            thumbnailUrl: s.anhdaidien || null,
            isFeatured: parseInt(String(s.noibat || "0")) === 1,
            isActive: true,
            sortOrder: parseInt(String(s.stt_hienthi || "0")) || ok,
            metaTitle: s.tieudeseo?.trim() || null,
            metaDescription: s.mieutaseo?.trim() || null,
            viewCount: parseInt(String(s.luotxem || "0")) || 0,
          },
        });
      }
      ok++;
    } catch (e: any) {
      console.error(`  ✗ Service "${s.tieude}": ${e.message}`);
      skip++;
    }
  }

  console.log(`  Services: ${ok} created, ${skip} skipped`);
}

// ─── PHASE 14: Gallery Media (from module_images.json) ───────────────────────
async function migrateGalleryMedia() {
  if (!runPhase("gallery")) return;
  console.log("\n── Phase 14: Gallery Media (from module_images.json) ──");

  interface ModuleImage {
    id: string | number;
    gallery_image?: string;
    trangthai?: string | number;
  }

  const records = readJson<ModuleImage[]>("module_images.json");
  // Only process record id=1 which has the gallery images
  const galleryRecord = records.find(r => String(r.id) === "1");
  if (!galleryRecord?.gallery_image) {
    console.log("  No gallery_image data found in module_images.json");
    return;
  }

  const rawUrls = galleryRecord.gallery_image
    .split(",")
    .map(u => u.trim())
    .filter(u => u.length > 0);

  // Only keep Cloudinary URLs (skip old /uploads/ local paths)
  const urls = rawUrls.filter(u => u.includes("cloudinary.com") || u.startsWith("http"));

  let ok = 0, skip = 0;

  for (const url of urls) {
    if (idMaps.media.has(url)) { skip++; continue; }

    try {
      const existing = await prisma.media.findFirst({ where: { url } });
      if (existing) {
        idMaps.media.set(url, existing.id);
        skip++;
        continue;
      }

      if (!DRY_RUN) {
        const media = await prisma.media.create({
          data: {
            url,
            filename: mediaFilename(url),
            mimeType: guessMime(url),
            size: 0,
            alt: "Ảnh thư viện - Viện Phương Nam",
            uploadedById: adminUserId,
            // Tag as gallery image for easy querying
            resourceType: "gallery",
          },
        });
        idMaps.media.set(url, media.id);
      }
      ok++;
    } catch (e: any) {
      console.error(`  ✗ Gallery media "${url}": ${e.message}`);
      skip++;
    }
  }

  console.log(`  Gallery media: ${ok} created, ${skip} skipped (${urls.length} total URLs processed)`);
}

// ─── PHASE clear-categories: Delete & re-seed ─────────────────────────────────
async function clearCategories() {
  if (!runPhase("clear-categories")) return;
  console.log("\n── Phase clear-categories: Clearing all Category rows ──");

  if (!DRY_RUN) {
    // Null out FK references on Course (nullable)
    await prisma.course.updateMany({ data: { categoryId: null } });
    // Post.categoryId is non-nullable so we cannot set it to null.
    // Use raw SQL to disable FK enforcement for the delete (SQLite only).
    await prisma.$executeRawUnsafe("PRAGMA foreign_keys = OFF;");
    const deleted = await prisma.category.deleteMany({});
    await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON;");
    console.log(`  Deleted ${deleted.count} categories (FK enforcement disabled temporarily).`);
    console.log(`  Note: Post records still have stale categoryId values — they will be re-seeded in Phase 3.`);
  } else {
    console.log("  DRY RUN — would delete all categories");
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  JSON → Prisma DB Migration                  ║");
  if (DRY_RUN) console.log("║  MODE: DRY RUN (no writes)                   ║");
  if (WIPE) console.log("║  MODE: WIPE ENABLED                          ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  if (!fs.existsSync(JSON_DIR)) {
    console.error(`✗ JSON source directory not found: ${JSON_DIR}`);
    process.exit(1);
  }

  if (WIPE && !DRY_RUN) await wipeAll();

  // Reload adminUserId from DB if available
  const existingAdmin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
  if (existingAdmin) adminUserId = existingAdmin.id;

  await clearCategories();
  await migrateUsers();
  await migrateCategories();
  await migrateTags();
  await migrateStaff();
  await migratePartners();
  await migratePosts();
  await migrateCourses();
  await migratePages();
  await migrateConfigurations();
  await migrateMenuItems();
  await migrateVideos();
  await migrateServices();
  await migrateGalleryMedia();

  // ── Summary ──
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║  Migration Summary                            ║");
  console.log("╠══════════════════════════════════════════════╣");
  if (!DRY_RUN) {
    const [users, cats, tags, posts, courses, services, partners, staff, pages, media, configs, menus, videos] = await Promise.all([
      prisma.user.count(),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.post.count(),
      prisma.course.count(),
      prisma.service.count(),
      prisma.partner.count(),
      prisma.staff.count(),
      prisma.page.count(),
      prisma.media.count(),
      prisma.configuration.count(),
      prisma.menuItem.count(),
      prisma.video.count(),
    ]);
    console.log(`║  Users:          ${String(users).padEnd(28)}║`);
    console.log(`║  Categories:     ${String(cats).padEnd(28)}║`);
    console.log(`║  Tags:           ${String(tags).padEnd(28)}║`);
    console.log(`║  Posts:          ${String(posts).padEnd(28)}║`);
    console.log(`║  Courses:        ${String(courses).padEnd(28)}║`);
    console.log(`║  Services:       ${String(services).padEnd(28)}║`);
    console.log(`║  Partners:       ${String(partners).padEnd(28)}║`);
    console.log(`║  Staff:          ${String(staff).padEnd(28)}║`);
    console.log(`║  Pages:          ${String(pages).padEnd(28)}║`);
    console.log(`║  Media records:  ${String(media).padEnd(28)}║`);
    console.log(`║  Configurations: ${String(configs).padEnd(28)}║`);
    console.log(`║  Menu items:     ${String(menus).padEnd(28)}║`);
    console.log(`║  Videos:         ${String(videos).padEnd(28)}║`);
  } else {
    console.log("║  DRY RUN — no records were written            ║");
  }
  console.log("╚══════════════════════════════════════════════╝");
}

main()
  .catch(e => {
    console.error("\n✗ Migration failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
