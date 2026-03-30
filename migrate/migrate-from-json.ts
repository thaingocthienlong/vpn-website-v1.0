/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import * as bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

const CURRENT_FILE = fileURLToPath(import.meta.url);
const CURRENT_DIR = path.dirname(CURRENT_FILE);
const PROJECT_ROOT = path.resolve(CURRENT_DIR, "..");
const JSON_DIR = path.resolve(CURRENT_DIR, "sql_json_export");
const REPORT_DIR = path.resolve(PROJECT_ROOT, "reports");

type SupportedPhase =
  | "users"
  | "categories"
  | "clear-categories"
  | "tags"
  | "staff"
  | "partners"
  | "posts"
  | "courses"
  | "pages"
  | "config"
  | "menus"
  | "services"
  | "reviews"
  | "homepage"
  | "gallery";

type AuditBucket = "import_in_v1" | "import_with_repair" | "defer_out_of_scope";

interface AuditEntry {
  dataset: string;
  bucket: AuditBucket;
  phase: string | null;
  targetModels: string[];
  reason: string;
  exists: boolean;
}

interface PreflightReport {
  generatedAt: string;
  jsonDir: string;
  selectedPhase: string;
  activePhases: string[];
  supportedPhases: string[];
  deferredPhases: string[];
  auditEntries: AuditEntry[];
  missingRequiredFiles: Array<{ phase: string; file: string }>;
}

interface RunReport {
  generatedAt: string;
  mode: "dry-run" | "apply" | "audit-only";
  selectedPhase: string;
  jsonDir: string;
  activePhases: string[];
  unresolvedAssetPaths: string[];
  warnings: {
    menus: string[];
    reviews: string[];
    homepage: string[];
  };
  homepageSectionCoverage: {
    importedKeys: string[];
    deferredModuleIds: number[];
  };
  phaseSummaries: Record<string, { created: number; skipped: number; errors: number; notes?: string[] }>;
}

type JsonRecord = Record<string, unknown>;

const SUPPORTED_PHASES: SupportedPhase[] = [
  "users",
  "categories",
  "clear-categories",
  "tags",
  "staff",
  "partners",
  "posts",
  "courses",
  "pages",
  "config",
  "menus",
  "services",
  "reviews",
  "homepage",
  "gallery",
];

const DEFERRED_PHASES = ["contacts", "course-partners", "videos"];

const PHASE_REQUIREMENTS: Record<SupportedPhase, string[]> = {
  users: ["user.json"],
  categories: ["category_post.json", "category_service.json"],
  "clear-categories": [],
  tags: ["detail_tags.json"],
  staff: ["banlanhdao.json", "bancovan.json"],
  partners: ["doitac.json"],
  posts: ["post.json", "category_post.json"],
  courses: ["hosomoitruong.json"],
  pages: ["page_all.json"],
  config: ["configurations.json", "info_website.json"],
  menus: ["menu.json", "menufooter.json", "menufooter2.json", "menufooter3.json", "menufooter4.json"],
  services: ["service.json"],
  reviews: ["feel.json"],
  homepage: ["space_module_home.json", "module_video_home.json", "module_images.json"],
  gallery: ["module_images.json"],
};

const SUPPORTED_DATASET_AUDIT: Record<string, Omit<AuditEntry, "dataset" | "exists">> = {
  "user.json": { bucket: "import_in_v1", phase: "users", targetModels: ["User"], reason: "Primary user source for account migration." },
  "category_post.json": { bucket: "import_in_v1", phase: "categories", targetModels: ["Category"], reason: "Mapped to POST categories." },
  "category_service.json": { bucket: "import_in_v1", phase: "categories", targetModels: ["Category"], reason: "Mapped to COURSE categories in d7a8." },
  "detail_tags.json": { bucket: "import_in_v1", phase: "tags", targetModels: ["Tag"], reason: "Dedicated tag source." },
  "banlanhdao.json": { bucket: "import_in_v1", phase: "staff", targetModels: ["Department", "StaffType", "Staff"], reason: "Leadership staff source." },
  "bancovan.json": { bucket: "import_in_v1", phase: "staff", targetModels: ["Department", "StaffType", "Staff"], reason: "Advisory staff source." },
  "doitac.json": { bucket: "import_in_v1", phase: "partners", targetModels: ["Partner", "Media"], reason: "Partner records with logos." },
  "post.json": { bucket: "import_in_v1", phase: "posts", targetModels: ["Post", "PostTag", "Media"], reason: "Primary news/article source." },
  "hosomoitruong.json": { bucket: "import_in_v1", phase: "courses", targetModels: ["Course", "ContentSection", "Media"], reason: "Training/course source." },
  "page_all.json": { bucket: "import_in_v1", phase: "pages", targetModels: ["Page", "Media"], reason: "Static page source." },
  "configurations.json": { bucket: "import_in_v1", phase: "config", targetModels: ["Configuration"], reason: "General website configuration source." },
  "info_website.json": { bucket: "import_in_v1", phase: "config", targetModels: ["Configuration"], reason: "Website identity configuration source." },
  "menu.json": { bucket: "import_with_repair", phase: "menus", targetModels: ["MenuItem"], reason: "Needs URL normalization and hierarchy repair." },
  "menufooter.json": { bucket: "import_with_repair", phase: "menus", targetModels: ["MenuItem"], reason: "Footer menu source uses a different shape." },
  "menufooter2.json": { bucket: "import_with_repair", phase: "menus", targetModels: ["MenuItem"], reason: "Footer menu source uses a different shape." },
  "menufooter3.json": { bucket: "import_with_repair", phase: "menus", targetModels: ["MenuItem"], reason: "Footer menu source uses a different shape." },
  "menufooter4.json": { bucket: "import_with_repair", phase: "menus", targetModels: ["MenuItem"], reason: "Footer menu source uses a different shape." },
  "service.json": { bucket: "import_with_repair", phase: "services", targetModels: ["Page", "ContentSection", "Media"], reason: "Services in d7a8 are stored as Page rows with template = service." },
  "feel.json": { bucket: "import_with_repair", phase: "reviews", targetModels: ["Review", "Media"], reason: "Testimonials map into Review and optional avatar Media." },
  "space_module_home.json": { bucket: "import_with_repair", phase: "homepage", targetModels: ["HomepageSection"], reason: "Canonical homepage section mapping is required for d7a8 runtime." },
  "module_video_home.json": { bucket: "import_with_repair", phase: "homepage", targetModels: ["HomepageSection"], reason: "Provides video section configuration." },
  "module_images.json": { bucket: "import_with_repair", phase: "homepage", targetModels: ["HomepageSection", "Media"], reason: "Provides gallery config and remote gallery media URLs." },
  "customers.json": { bucket: "defer_out_of_scope", phase: null, targetModels: ["ContactForm"], reason: "Deferred from v1." },
  "video.json": { bucket: "defer_out_of_scope", phase: null, targetModels: [], reason: "No standalone Video model exists in d7a8." },
};

const CANONICAL_HOMEPAGE_SECTIONS = [
  { legacyId: 1, key: "hero" },
  { legacyId: 2, key: "reviews" },
  { legacyId: 3, key: "partners" },
  { legacyId: 4, key: "services" },
  { legacyId: 5, key: "video" },
  { legacyId: 6, key: "training" },
  { legacyId: 7, key: "news" },
  { legacyId: 8, key: "gallery" },
  { legacyId: 9, key: "cta" },
  { legacyId: 10, key: "contact" },
] as const;

const HOMEPAGE_DEFAULTS: Record<string, { title: string; subtitle: string; config: Record<string, unknown> }> = {
  hero: {
    title: "Viện Phương Nam",
    subtitle: "Đào tạo, nghiên cứu và kết nối nguồn lực xã hội vì cộng đồng.",
    config: {
      ctaPrimary: { text: "Khám phá chương trình", href: "/dao-tao" },
      ctaSecondary: { text: "Liên hệ tư vấn", href: "/lien-he" },
    },
  },
  reviews: {
    title: "Cảm nhận từ học viên và đối tác",
    subtitle: "Những phản hồi thực tế từ người học, chuyên gia và các đơn vị đồng hành cùng Viện Phương Nam.",
    config: {},
  },
  partners: {
    title: "Đối tác liên kết",
    subtitle: "Mạng lưới đối tác đồng hành trong đào tạo, nghiên cứu và phát triển nguồn lực xã hội.",
    config: {},
  },
  services: {
    title: "Dịch vụ và lĩnh vực hoạt động",
    subtitle: "Các chương trình tư vấn, đào tạo và hỗ trợ chuyên môn gắn với nhu cầu thực tiễn.",
    config: {},
  },
  video: {
    title: "Video nổi bật",
    subtitle: "Hoạt động, sự kiện và những câu chuyện từ hành trình phát triển của Viện Phương Nam.",
    config: { videos: [] },
  },
  training: {
    title: "Chương trình đào tạo",
    subtitle: "Các khóa học, chuyên đề và chương trình phát triển năng lực theo định hướng thực tiễn.",
    config: {},
  },
  news: {
    title: "Tin tức và sự kiện",
    subtitle: "Cập nhật hoạt động đào tạo, nghiên cứu, hợp tác và các chương trình nổi bật của Viện.",
    config: {},
  },
  gallery: {
    title: "Hình ảnh hoạt động",
    subtitle: "Khoảnh khắc nổi bật từ các chương trình đào tạo, hội thảo và hoạt động cộng đồng.",
    config: { images: [] },
  },
  cta: {
    title: "Kết nối cùng Viện Phương Nam",
    subtitle: "Trao đổi với chúng tôi về chương trình đào tạo, hợp tác chuyên môn và các sáng kiến vì cộng đồng.",
    config: {
      primaryCTA: { text: "Liên hệ với chúng tôi", href: "/lien-he" },
      secondaryCTA: { text: "Khám phá dịch vụ", href: "/dich-vu" },
    },
  },
  contact: {
    title: "Thông tin liên hệ",
    subtitle: "Chúng tôi sẵn sàng hỗ trợ về đào tạo, hợp tác và các hoạt động chuyên môn.",
    config: {
      address: "45 Đinh Tiên Hoàng, Phường Sài Gòn, TP.HCM (Quận 1)",
      phone: "0912 114 511",
      email: "vanphong@vienphuongnam.com.vn",
      hours: "Liên hệ trước để được sắp xếp lịch làm việc phù hợp.",
    },
  },
};

const ROUTE_EQUIVALENTS = [
  { vi: "/gioi-thieu/tam-nhin-su-menh", en: "/en/about/vision-mission" },
  { vi: "/gioi-thieu/co-cau-to-chuc", en: "/en/about/structure" },
  { vi: "/gioi-thieu/hoi-dong-co-van", en: "/en/about/advisory-board" },
  { vi: "/gioi-thieu/doi-tac", en: "/en/about/partners" },
  { vi: "/gioi-thieu", en: "/en/about" },
  { vi: "/dao-tao/dang-ky", en: "/en/training/register" },
  { vi: "/dao-tao", en: "/en/training" },
  { vi: "/tin-tuc", en: "/en/news" },
  { vi: "/dich-vu", en: "/en/services" },
  { vi: "/lien-he", en: "/en/contact" },
  { vi: "/chinh-sach-bao-mat", en: "/en/privacy-policy" },
  { vi: "/dieu-khoan-su-dung", en: "/en/terms" },
  { vi: "/", en: "/en" },
] as const;

const LEGACY_PATH_ALIASES: Record<string, string> = {
  "/gioi-thieu-chung": "/gioi-thieu",
  "/hoi-dong-co-van-khoa-hoc": "/gioi-thieu/hoi-dong-co-van",
  "/hoi-dong-co-van": "/gioi-thieu/hoi-dong-co-van",
  "/bai-viet/tin-tuc": "/tin-tuc",
  "/bai-viet/hoi-thao": "/tin-tuc",
  "/bai-viet/su-kien": "/tin-tuc",
  "/gioi-thieu/": "/gioi-thieu",
};

const LEGACY_HOST_ALIASES: Record<string, string> = {
  "trangchu.com": "/",
  "lienhe.com": "/lien-he",
  "gioithieu.com": "/gioi-thieu",
  "baiviet.com.vn": "/tin-tuc",
  "sanpham.com": "/dao-tao",
};

const MENU_LABEL_OVERRIDES: Record<string, { vi: string; en: string }> = {
  "/": { vi: "Trang chủ", en: "Home" },
  "/gioi-thieu": { vi: "Giới thiệu", en: "About" },
  "/dao-tao": { vi: "Đào tạo", en: "Training" },
  "/tin-tuc": { vi: "Tin tức", en: "News" },
  "/dich-vu": { vi: "Dịch vụ", en: "Services" },
  "/lien-he": { vi: "Liên hệ", en: "Contact" },
};

const phaseSummaries: RunReport["phaseSummaries"] = {};
const unresolvedAssetPaths = new Set<string>();
const menuWarnings: string[] = [];
const reviewWarnings: string[] = [];
const homepageWarnings: string[] = [];
const importedHomepageSectionKeys = new Set<string>();
const deferredHomepageModuleIds = new Set<number>();

const idMaps = {
  users: new Map<string, string>(),
  categories: new Map<string, string>(),
  tags: new Map<string, string>(),
  departments: new Map<string, string>(),
  staffTypes: new Map<string, string>(),
  media: new Map<string, string>(),
  posts: new Map<string, string>(),
  courses: new Map<string, string>(),
  partners: new Map<string, string>(),
  staff: new Map<string, string>(),
  pages: new Map<string, string>(),
  services: new Map<string, string>(),
};

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const WIPE = args.includes("--wipe");
const CONFIRM_WIPE = args.includes("--confirm-wipe");
const AUDIT_ONLY = args.includes("--audit-only");
const phaseArg = (() => {
  const idx = args.indexOf("--phase");
  return idx !== -1 ? args[idx + 1] : "all";
})();
const runPhase = (name: string) => phaseArg === "all" || phaseArg === name;

let adminUserId = "";

function ensureReportDir() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

function writeJsonReport<T>(filename: string, data: T): string {
  ensureReportDir();
  const reportPath = path.join(REPORT_DIR, filename);
  fs.writeFileSync(reportPath, JSON.stringify(data, null, 2), "utf-8");
  return reportPath;
}

function setPhaseSummary(phase: string, created: number, skipped: number, errors = 0, notes?: string[]) {
  phaseSummaries[phase] = { created, skipped, errors, notes };
}

function getJsonFiles(): string[] {
  if (!fs.existsSync(JSON_DIR)) return [];
  return fs.readdirSync(JSON_DIR).filter((file) => file.endsWith(".json")).sort();
}

function buildAuditEntries(): AuditEntry[] {
  return getJsonFiles().map((dataset) => {
    const mapped = SUPPORTED_DATASET_AUDIT[dataset];
    if (mapped) {
      return { dataset, exists: true, ...mapped };
    }

    return {
      dataset,
      exists: true,
      bucket: "defer_out_of_scope",
      phase: null,
      targetModels: [],
      reason: "No v1 mapping defined for this legacy dataset.",
    };
  });
}

function getActivePhases(selectedPhase: string): SupportedPhase[] {
  if (selectedPhase === "all") {
    return SUPPORTED_PHASES.filter((phase) => phase !== "clear-categories");
  }
  if (!SUPPORTED_PHASES.includes(selectedPhase as SupportedPhase)) {
    return [];
  }
  return [selectedPhase as SupportedPhase];
}

function validatePhaseSelection(selectedPhase: string) {
  if (selectedPhase === "all") return;
  if (SUPPORTED_PHASES.includes(selectedPhase as SupportedPhase)) return;
  if (DEFERRED_PHASES.includes(selectedPhase)) {
    throw new Error(`Phase "${selectedPhase}" is deferred in v1 because the current schema or importer does not support it yet.`);
  }
  throw new Error(`Unknown phase "${selectedPhase}". Supported phases: ${SUPPORTED_PHASES.join(", ")}.`);
}

function buildPreflightReport(selectedPhase: string): PreflightReport {
  const activePhases = getActivePhases(selectedPhase);
  const missingRequiredFiles: Array<{ phase: string; file: string }> = [];

  for (const phase of activePhases) {
    for (const file of PHASE_REQUIREMENTS[phase]) {
      if (!fs.existsSync(path.join(JSON_DIR, file))) {
        missingRequiredFiles.push({ phase, file });
      }
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    jsonDir: JSON_DIR,
    selectedPhase,
    activePhases,
    supportedPhases: SUPPORTED_PHASES,
    deferredPhases: DEFERRED_PHASES,
    auditEntries: buildAuditEntries(),
    missingRequiredFiles,
  };
}

function readJson<T>(filename: string): T {
  const filePath = path.join(JSON_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`JSON source file not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
}

function nonEmptyString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function firstNonEmpty(...values: unknown[]): string {
  for (const value of values) {
    const normalized = nonEmptyString(value);
    if (normalized) return normalized;
  }
  return "";
}

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\\r\\n|\\r|\\n/g, " ")
    .replace(/\r\n|\r|\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function cleanContent(html: string): string {
  return (html || "")
    .replace(/<div class="eJOY__extension_root_class"[^>]*>.*?<\/div>/gis, "")
    .replace(/id="eJOY__extension_root"[^"]*"/g, "")
    .trim();
}

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
  let slug = base || "item";
  let index = 1;
  while (!slug || existing.has(slug)) {
    slug = `${base || "item"}-${index}`;
    index += 1;
  }
  existing.add(slug);
  return slug;
}

function pushUnique(target: string[], value: string) {
  if (!target.includes(value)) target.push(value);
}

function isPlaceholderMenuLabel(label: string): boolean {
  const normalized = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
  return /^tieu de tuy chinh \d+$/.test(normalized);
}

function mediaFilename(url: string): string {
  try {
    const parsed = new URL(url);
    return path.basename(parsed.pathname) || "remote-file";
  } catch {
    return path.basename(url) || "remote-file";
  }
}

function guessMime(url: string): string | null {
  const lower = url.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".mp4")) return "video/mp4";
  return null;
}

function normalizeWebsiteUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `https://${trimmed}`;
}

function getLegacyInstitutionProfile() {
  const legacyConfig = toArray(readJson<JsonRecord[] | JsonRecord>("configurations.json"))[0] || {};
  const legacySite = toArray(readJson<JsonRecord[] | JsonRecord>("info_website.json"))[0] || {};

  const siteName = firstNonEmpty(legacySite.name, "Viện Phương Nam");
  const organizationName = firstNonEmpty(
    legacyConfig.tencongty,
    "Viện phát triển nguồn lực xã hội Phương Nam",
  );
  const slogan = firstNonEmpty(
    legacySite.slogan,
    "Đào tạo, nghiên cứu và kết nối nguồn lực xã hội vì cộng đồng.",
  );
  const address = firstNonEmpty(
    legacyConfig.diachi1,
    legacyConfig.diachi2,
    "45 Đinh Tiên Hoàng, Phường Sài Gòn, TP.HCM (Quận 1)",
  );
  const phonePrimary = firstNonEmpty(
    legacyConfig.hotline0,
    legacyConfig.hotline1,
    "0912 114 511",
  );
  const phoneSecondary = firstNonEmpty(
    legacyConfig.hotline1,
    legacyConfig.hotline0,
    "(028) 2242 6789",
  );
  const email = firstNonEmpty(
    legacyConfig.email1,
    "vanphong@vienphuongnam.com.vn",
  );
  const websiteUrl = normalizeWebsiteUrl(firstNonEmpty(legacyConfig.duongdanwebsite, "vienphuongnam.com.vn"));
  const facebookUrl = firstNonEmpty(legacyConfig.duongdanfacebook);
  const youtubeUrl = firstNonEmpty(legacyConfig.duongdanyoutube);
  const mapsUrl = firstNonEmpty(legacyConfig.duongdanmaps);
  const logoUrl = firstNonEmpty(legacySite.mainlogo, legacySite.logo, legacySite.logowhite);
  const faviconUrl = firstNonEmpty(legacySite.favicon);
  const copyright = firstNonEmpty(
    legacySite.copyright0,
    legacySite.copyright,
    `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`,
  );
  const footerDescription = firstNonEmpty(
    `${organizationName}. ${slogan}`,
    organizationName,
    slogan,
  );

  return {
    siteName,
    organizationName,
    slogan,
    address,
    phonePrimary,
    phoneSecondary,
    email,
    websiteUrl,
    facebookUrl,
    youtubeUrl,
    mapsUrl,
    logoUrl,
    faviconUrl,
    copyright,
    footerDescription,
  };
}

function buildNormalizedConfigurationSeeds() {
  const profile = getLegacyInstitutionProfile();

  return [
    { key: "general.site_name", value: profile.siteName, group: "general" },
    { key: "general.site_name_en", value: "Vien Phuong Nam Institute", group: "general" },
    { key: "general.organization_name", value: profile.organizationName, group: "general" },
    { key: "general.tagline", value: profile.slogan, group: "general" },
    { key: "general.contact_phone", value: profile.phonePrimary, group: "general" },
    { key: "general.contact_phone_secondary", value: profile.phoneSecondary, group: "general" },
    { key: "general.contact_email", value: profile.email, group: "general" },
    { key: "general.contact_address", value: profile.address, group: "general" },
    { key: "general.social_facebook", value: profile.facebookUrl, group: "general" },
    { key: "general.social_youtube", value: profile.youtubeUrl, group: "general" },
    { key: "general.website_url", value: profile.websiteUrl, group: "general" },
    { key: "general.map_url", value: profile.mapsUrl, group: "general" },
    { key: "general.logo_url", value: profile.logoUrl, group: "general" },
    { key: "general.favicon_url", value: profile.faviconUrl, group: "general" },
    { key: "general.header_cta_text", value: "Liên hệ tư vấn", group: "general" },
    { key: "general.header_cta_text_en", value: "Contact Us", group: "general" },
    { key: "general.header_cta_url", value: "/lien-he", group: "general" },
    { key: "general.footer_description", value: profile.footerDescription, group: "general" },
    { key: "general.footer_copyright", value: profile.copyright, group: "general" },
    { key: "header.logo_url", value: profile.logoUrl, group: "header" },
    { key: "header.logo_text", value: profile.siteName, group: "header" },
    { key: "header.phone", value: profile.phonePrimary, group: "header" },
    { key: "header.cta_text", value: "Liên hệ tư vấn", group: "header" },
    { key: "header.cta_text_en", value: "Contact Us", group: "header" },
    { key: "header.cta_url", value: "/lien-he", group: "header" },
    { key: "footer.description", value: profile.footerDescription, group: "footer" },
    { key: "footer.phone", value: profile.phonePrimary, group: "footer" },
    { key: "footer.email", value: profile.email, group: "footer" },
    { key: "footer.address", value: profile.address, group: "footer" },
    { key: "footer.facebook", value: profile.facebookUrl, group: "footer" },
    { key: "footer.youtube", value: profile.youtubeUrl, group: "footer" },
    { key: "footer.copyright", value: profile.copyright, group: "footer" },
    { key: "footer.privacy_label", value: "Chính sách bảo mật", group: "footer" },
    { key: "footer.privacy_label_en", value: "Privacy Policy", group: "footer" },
    { key: "footer.privacy_url", value: "/chinh-sach-bao-mat", group: "footer" },
    { key: "footer.privacy_url_en", value: "/en/privacy-policy", group: "footer" },
    { key: "footer.terms_label", value: "Điều khoản sử dụng", group: "footer" },
    { key: "footer.terms_label_en", value: "Terms of Service", group: "footer" },
    { key: "footer.terms_url", value: "/dieu-khoan-su-dung", group: "footer" },
    { key: "footer.terms_url_en", value: "/en/terms", group: "footer" },
  ].filter((entry) => entry.value);
}

function normalizeMenuLabel(value: string): string {
  return normalizeWhitespace(stripHtml(value));
}

function normalizePath(pathValue: string): string {
  const trimmed = pathValue.trim();
  if (!trimmed || trimmed === "#") return "#";
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const normalized = withLeadingSlash.replace(/\/{2,}/g, "/").replace(/\/+$/, "");
  return normalized || "/";
}

function resolveEquivalentEnPath(viPath: string): string | null {
  for (const mapping of ROUTE_EQUIVALENTS) {
    if (mapping.vi === viPath) return mapping.en;
  }
  for (const mapping of ROUTE_EQUIVALENTS) {
    if (mapping.vi !== "/" && viPath.startsWith(`${mapping.vi}/`)) {
      return `${mapping.en}${viPath.slice(mapping.vi.length)}`;
    }
  }
  return null;
}

function normalizeLegacyInternalPath(rawUrl: string): string {
  const value = normalizePath(rawUrl);
  if (LEGACY_PATH_ALIASES[value]) {
    return LEGACY_PATH_ALIASES[value];
  }
  if (value.startsWith("/nghien-cuu/") || value.startsWith("/dich-vu/")) {
    const slug = value.split("/").filter(Boolean).pop();
    if (slug) {
      return `/dich-vu/${slug}`;
    }
  }
  return value;
}

function resolveMenuUrls(rawUrl: string) {
  const trimmed = rawUrl.trim();
  const normalizedHostAlias = LEGACY_HOST_ALIASES[trimmed.toLowerCase()];
  if (normalizedHostAlias) {
    return { url: normalizedHostAlias, target: "_self" as const };
  }
  if (trimmed.startsWith("//")) {
    return { url: `https:${trimmed}`, target: "_blank" as const };
  }
  if (/^https?:\/\//i.test(trimmed)) {
    const isInternal = trimmed.includes("vienphuongnam.com");
    if (!isInternal) {
      return { url: trimmed, target: "_blank" as const };
    }
    try {
      const parsed = new URL(trimmed);
      return { url: normalizeLegacyInternalPath(parsed.pathname), target: "_self" as const };
    } catch {
      return { url: trimmed, target: "_blank" as const };
    }
  }
  if (trimmed === "#") {
    return { url: "#", target: "_self" as const };
  }
  return { url: normalizeLegacyInternalPath(trimmed), target: "_self" as const };
}

function resolveMenuLabels(label: string, url: string) {
  const override = MENU_LABEL_OVERRIDES[url];
  return {
    label: override?.vi || label,
    label_en: override?.en || null,
  };
}

function inferLegacyEnabled(value: unknown): boolean {
  const normalized = String(value ?? "").trim();
  if (!normalized) return true;
  return normalized === "0";
}

function buildTabbedSections(record: Record<string, unknown>) {
  const sections: Array<{ sectionKey: string; title: string; content: string; sortOrder: number }> = [];
  const mainContent = typeof record.mieutachitiet === "string" ? record.mieutachitiet : "";
  if (mainContent.trim()) {
    sections.push({
      sectionKey: "main",
      title: "Mô tả chi tiết",
      content: cleanContent(mainContent),
      sortOrder: 0,
    });
  }

  for (let index = 1; index <= 10; index += 1) {
    const title = typeof record[`t${index}`] === "string" ? String(record[`t${index}`]) : "";
    const content = typeof record[`c${index}`] === "string" ? String(record[`c${index}`]) : "";
    if (!title.trim() && !content.trim()) continue;
    sections.push({
      sectionKey: `tab_${index}`,
      title: title.trim() || `tab_${index}`,
      content: cleanContent(content),
      sortOrder: index,
    });
  }

  return sections;
}

function youtubeToEmbed(url: string): string {
  if (!url) return url;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const longMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;
  return url;
}

async function ensureSystemUser() {
  let systemUser = await prisma.user.findFirst({ where: { email: "system@sisrd.vn" } });
  if (!systemUser && !DRY_RUN) {
    systemUser = await prisma.user.create({
      data: {
        email: "system@sisrd.vn",
        name: "System",
        password: await bcrypt.hash("ChangeMe@2026!", 10),
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });
  }
  adminUserId = systemUser?.id || "dry-run-system-user";
  return systemUser;
}

async function ensureMedia(url: string, altText = "", resourceType: string | null = null): Promise<string | null> {
  if (!url || !url.trim()) return null;
  if (url.startsWith("/uploads/") || url.startsWith("/fontend/")) {
    unresolvedAssetPaths.add(url);
    return null;
  }
  if (idMaps.media.has(url)) return idMaps.media.get(url)!;

  const existing = await prisma.media.findFirst({ where: { url } });
  if (existing) {
    idMaps.media.set(url, existing.id);
    return existing.id;
  }

  if (!DRY_RUN) {
    const media = await prisma.media.create({
      data: {
        url,
        secureUrl: url.startsWith("https://") ? url : null,
        filename: mediaFilename(url),
        format: path.extname(mediaFilename(url)).replace(".", "") || null,
        resourceType,
        mimeType: guessMime(url),
        size: 0,
        alt: altText || null,
        uploadedById: adminUserId,
      },
    });
    idMaps.media.set(url, media.id);
    return media.id;
  }

  return "dry-run-media-id";
}

async function wipeAll() {
  console.log("⚠  Wiping migrated data...");
  await prisma.postTag.deleteMany({});
  await prisma.contentSection.deleteMany({});
  await prisma.coursePartner.deleteMany({});
  await prisma.homepageSection.deleteMany({});
  await prisma.review.deleteMany({});
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
  setPhaseSummary("wipe", 0, 0, 0, ["Existing migrated content was removed before import."]);
}

async function clearCategories() {
  if (phaseArg !== "clear-categories") return;
  console.log("\n── Phase clear-categories: Clearing all Category rows ──");

  if (!DRY_RUN) {
    await prisma.course.updateMany({ data: { categoryId: null } });
    await prisma.$executeRawUnsafe("PRAGMA foreign_keys = OFF;");
    const deleted = await prisma.category.deleteMany({});
    await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON;");
    console.log(`  Deleted ${deleted.count} categories.`);
    setPhaseSummary("clear-categories", deleted.count, 0, 0, ["Category rows deleted before re-seeding."]);
  } else {
    console.log("  DRY RUN — would delete all categories");
    setPhaseSummary("clear-categories", 0, 0, 0, ["Dry-run only; no categories deleted."]);
  }
}

async function migrateUsers() {
  if (!runPhase("users")) return;
  console.log("\n── Phase 1: Users ──");

  interface OldUser {
    id: string | number;
    username?: string;
    fullname?: string;
    password?: string;
    phanquyen?: string | number;
    avatar?: string;
  }

  const users = toArray(readJson<OldUser[] | OldUser>("user.json"));
  let created = 0;
  let skipped = 0;
  let refreshed = 0;

  for (const user of users) {
    const username = nonEmptyString(user.username).toLowerCase();
    if (!username) {
      skipped += 1;
      continue;
    }

    const email = username.includes("@") ? username : `${username}@sisrd.vn`;
    const name = firstNonEmpty(user.fullname, username, "Imported User");
    const passwordHash = await bcrypt.hash(nonEmptyString(user.password) || "ChangeMe@2026!", 10);
    const role = Number(user.phanquyen ?? 0) >= 2 ? "SUPER_ADMIN" : "CONTENT_EDITOR";

    try {
      const existing = await prisma.user.findFirst({ where: { email } });
      if (!DRY_RUN) {
        const payload = {
          email,
          name,
          password: existing?.password || passwordHash,
          role,
          avatar: nonEmptyString(user.avatar) || null,
          isActive: true,
        };

        if (existing) {
          await prisma.user.update({ where: { id: existing.id }, data: payload });
          idMaps.users.set(String(user.id), existing.id);
          refreshed += 1;
          skipped += 1;
        } else {
          const createdUser = await prisma.user.create({ data: payload });
          idMaps.users.set(String(user.id), createdUser.id);
          created += 1;
        }
      } else {
        if (existing) {
          idMaps.users.set(String(user.id), existing.id);
          refreshed += 1;
          skipped += 1;
        } else {
          created += 1;
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  ✗ User "${email}": ${message}`);
    }
  }

  const systemUser = await prisma.user.findFirst({ where: { email: "system@sisrd.vn" } });
  adminUserId = systemUser?.id || adminUserId;
  console.log(`  Users: ${created} created, ${refreshed} refreshed, ${skipped} matched`);
  setPhaseSummary("users", created, skipped, 0, [`${refreshed} existing users refreshed.`]);
}

async function migrateCategories() {
  if (!runPhase("categories")) return;
  console.log("\n── Phase 2: Categories ──");

  interface OldCategory {
    id: string | number;
    tenchuyenmuc?: string;
    duongdan?: string;
    mieutangan?: string;
    stt_hienthi?: string | number;
    trangthai?: string | number;
  }

  const postCategories = toArray(readJson<OldCategory[] | OldCategory>("category_post.json"));
  const courseCategories = toArray(readJson<OldCategory[] | OldCategory>("category_service.json"));
  const slugPool = new Set<string>((await prisma.category.findMany({ select: { slug: true } })).map((row) => row.slug));
  let created = 0;
  let skipped = 0;
  let refreshed = 0;

  const upsertCategory = async (record: OldCategory, type: "POST" | "COURSE") => {
    const name = normalizeWhitespace(nonEmptyString(record.tenchuyenmuc));
    if (!name) {
      skipped += 1;
      return;
    }

    const mapKey = `${type.toLowerCase()}_${record.id}`;
    const rawSlug = nonEmptyString(record.duongdan) || slugify(name);
    const existing = await prisma.category.findFirst({
      where: {
        type,
        OR: [{ slug: rawSlug }, { name }],
      },
    });
    const slug = existing ? existing.slug : uniqueSlug(rawSlug || slugify(name), slugPool);
    const payload = {
      name,
      slug,
      type,
      description: nonEmptyString(record.mieutangan) || null,
      sortOrder: Number(record.stt_hienthi ?? 0) || 0,
      isActive: String(record.trangthai ?? "1") !== "0",
    };

    if (!DRY_RUN) {
      if (existing) {
        const updated = await prisma.category.update({ where: { id: existing.id }, data: payload });
        idMaps.categories.set(mapKey, updated.id);
        refreshed += 1;
        skipped += 1;
      } else {
        const createdCategory = await prisma.category.create({ data: payload });
        idMaps.categories.set(mapKey, createdCategory.id);
        created += 1;
      }
    } else {
      if (existing) {
        idMaps.categories.set(mapKey, existing.id);
        refreshed += 1;
        skipped += 1;
      } else {
        created += 1;
      }
    }
  };

  for (const category of postCategories) await upsertCategory(category, "POST");
  for (const category of courseCategories) await upsertCategory(category, "COURSE");

  console.log(`  Categories: ${created} created, ${refreshed} refreshed, ${skipped} matched`);
  setPhaseSummary("categories", created, skipped, 0, [`${refreshed} existing categories refreshed.`]);
}

async function migrateTags() {
  if (!runPhase("tags")) return;
  console.log("\n── Phase 3: Tags ──");

  interface OldTag {
    id: string | number;
    tukhoa?: string;
  }

  const tags = toArray(readJson<OldTag[] | OldTag>("detail_tags.json"));
  const slugPool = new Set<string>((await prisma.tag.findMany({ select: { slug: true } })).map((row) => row.slug));
  let created = 0;
  let skipped = 0;
  let refreshed = 0;

  for (const tag of tags) {
    const name = normalizeWhitespace(nonEmptyString(tag.tukhoa));
    if (!name || name === "Từ khóa 1" || name.startsWith("Từ khóa ")) {
      skipped += 1;
      continue;
    }

    const rawSlug = slugify(name);
    const existing = await prisma.tag.findFirst({
      where: {
        OR: [{ slug: rawSlug }, { name }],
      },
    });
    const slug = existing ? existing.slug : uniqueSlug(rawSlug, slugPool);

    if (!DRY_RUN) {
      if (existing) {
        await prisma.tag.update({ where: { id: existing.id }, data: { name, slug } });
        idMaps.tags.set(slug, existing.id);
        refreshed += 1;
        skipped += 1;
      } else {
        const createdTag = await prisma.tag.create({ data: { name, slug } });
        idMaps.tags.set(slug, createdTag.id);
        created += 1;
      }
    } else {
      if (existing) {
        idMaps.tags.set(slug, existing.id);
        refreshed += 1;
        skipped += 1;
      } else {
        created += 1;
      }
    }
  }

  console.log(`  Tags: ${created} created, ${refreshed} refreshed, ${skipped} matched`);
  setPhaseSummary("tags", created, skipped, 0, [`${refreshed} existing tags refreshed.`]);
}

async function migrateStaffFoundation() {
  const departments = [
    { key: "banlanhdao", name: "Ban Lãnh Đạo Viện", slug: "ban-lanh-dao-vien", sortOrder: 1 },
    { key: "bancovan", name: "Ban Cố Vấn", slug: "ban-co-van", sortOrder: 2 },
  ];
  const staffTypes = [
    { key: "vientruong", name: "Viện Trưởng", level: 1, sortOrder: 1, isAdvisory: false },
    { key: "phovientruong", name: "Phó Viện Trưởng", level: 2, sortOrder: 2, isAdvisory: false },
    { key: "uyvien", name: "Ủy Viên / Thành Viên", level: 3, sortOrder: 3, isAdvisory: false },
    { key: "covan", name: "Cố Vấn", level: 4, sortOrder: 4, isAdvisory: true },
    { key: "nhanvien", name: "Nhân Viên", level: 5, sortOrder: 5, isAdvisory: false },
  ];

  for (const department of departments) {
    const existing = await prisma.department.findFirst({ where: { slug: department.slug } });
    if (!DRY_RUN) {
      if (existing) {
        await prisma.department.update({
          where: { id: existing.id },
          data: {
            name: department.name,
            slug: department.slug,
            sortOrder: department.sortOrder,
            isActive: true,
          },
        });
        idMaps.departments.set(department.key, existing.id);
      } else {
        const createdDepartment = await prisma.department.create({
          data: {
            name: department.name,
            slug: department.slug,
            sortOrder: department.sortOrder,
            isActive: true,
          },
        });
        idMaps.departments.set(department.key, createdDepartment.id);
      }
    } else {
      idMaps.departments.set(department.key, existing?.id || `dry-${department.key}`);
    }
  }

  for (const staffType of staffTypes) {
    const existing = await prisma.staffType.findFirst({ where: { name: staffType.name } });
    if (!DRY_RUN) {
      if (existing) {
        await prisma.staffType.update({
          where: { id: existing.id },
          data: {
            name: staffType.name,
            level: staffType.level,
            sortOrder: staffType.sortOrder,
            isAdvisory: staffType.isAdvisory,
          },
        });
        idMaps.staffTypes.set(staffType.key, existing.id);
      } else {
        const createdStaffType = await prisma.staffType.create({
          data: {
            name: staffType.name,
            level: staffType.level,
            sortOrder: staffType.sortOrder,
            isAdvisory: staffType.isAdvisory,
          },
        });
        idMaps.staffTypes.set(staffType.key, createdStaffType.id);
      }
    } else {
      idMaps.staffTypes.set(staffType.key, existing?.id || `dry-${staffType.key}`);
    }
  }
}

function resolveStaffTypeKey(title: string): string {
  const normalized = title.toLowerCase();
  if (normalized.includes("viện trưởng") && !normalized.includes("phó")) return "vientruong";
  if (normalized.includes("phó viện trưởng") || normalized.includes("pho vien truong")) return "phovientruong";
  if (normalized.includes("cố vấn") || normalized.includes("co van")) return "covan";
  if (normalized.includes("ủy viên") || normalized.includes("uy vien") || normalized.includes("thành viên")) return "uyvien";
  return "nhanvien";
}

async function migrateStaff() {
  if (!runPhase("staff")) return;
  console.log("\n── Phase 4: Staff ──");
  await migrateStaffFoundation();

  interface OldStaff {
    id: string | number;
    name?: string;
    chucvu?: string;
    mieutangan?: string;
    anhdaidien?: string;
    stt_hienthi?: string | number;
    xuongdong?: string | number;
    email?: string;
    dienthoai?: string;
  }

  const sources = [
    { records: toArray(readJson<OldStaff[] | OldStaff>("banlanhdao.json")), departmentKey: "banlanhdao" },
    { records: toArray(readJson<OldStaff[] | OldStaff>("bancovan.json")), departmentKey: "bancovan" },
  ];

  let created = 0;
  let skipped = 0;
  let refreshed = 0;

  for (const source of sources) {
    const departmentId = idMaps.departments.get(source.departmentKey) || null;

    for (const staff of source.records) {
      const name = normalizeWhitespace(nonEmptyString(staff.name));
      if (!name) {
        skipped += 1;
        continue;
      }

      const existing = await prisma.staff.findFirst({ where: { name } });
      const avatarId = await ensureMedia(nonEmptyString(staff.anhdaidien), `${name} avatar`);
      const staffTypeId = idMaps.staffTypes.get(resolveStaffTypeKey(nonEmptyString(staff.chucvu))) || idMaps.staffTypes.get("nhanvien");
      const payload = {
        name,
        title: nonEmptyString(staff.chucvu) || null,
        bio: cleanContent(nonEmptyString(staff.mieutangan)) || null,
        avatarId,
        email: nonEmptyString(staff.email) || null,
        phone: nonEmptyString(staff.dienthoai) || null,
        departmentId,
        staffTypeId,
        sortOrder: Number(staff.stt_hienthi ?? 0) || 0,
        isActive: String(staff.xuongdong ?? "1") !== "0",
      };

      if (!DRY_RUN) {
        if (existing) {
          await prisma.staff.update({ where: { id: existing.id }, data: payload });
          idMaps.staff.set(String(staff.id), existing.id);
          refreshed += 1;
          skipped += 1;
        } else {
          const createdStaff = await prisma.staff.create({ data: payload });
          idMaps.staff.set(String(staff.id), createdStaff.id);
          created += 1;
        }
      } else {
        if (existing) {
          idMaps.staff.set(String(staff.id), existing.id);
          refreshed += 1;
          skipped += 1;
        } else {
          created += 1;
        }
      }
    }
  }

  console.log(`  Staff: ${created} created, ${refreshed} refreshed, ${skipped} matched`);
  setPhaseSummary("staff", created, skipped, 0, [`${refreshed} existing staff rows refreshed.`]);
}

async function migratePartners() {
  if (!runPhase("partners")) return;
  console.log("\n── Phase 5: Partners ──");

  interface OldPartner {
    id: string | number;
    name?: string;
    anhdaidien?: string;
    duongdan?: string;
    mieutangan?: string;
  }

  const partners = toArray(readJson<OldPartner[] | OldPartner>("doitac.json"));
  let created = 0;
  let skipped = 0;
  let refreshed = 0;

  for (const partner of partners) {
    const name = normalizeWhitespace(nonEmptyString(partner.name));
    if (!name) {
      skipped += 1;
      continue;
    }

    const existing = await prisma.partner.findFirst({ where: { name } });
    const logoId = await ensureMedia(nonEmptyString(partner.anhdaidien), `${name} logo`);
    const payload = {
      name,
      website: nonEmptyString(partner.duongdan) || null,
      logoId,
      description: stripHtml(nonEmptyString(partner.mieutangan)) || null,
      sortOrder: created + refreshed,
      isActive: true,
    };

    if (!DRY_RUN) {
      if (existing) {
        await prisma.partner.update({ where: { id: existing.id }, data: payload });
        idMaps.partners.set(String(partner.id), existing.id);
        refreshed += 1;
        skipped += 1;
      } else {
        const createdPartner = await prisma.partner.create({ data: payload });
        idMaps.partners.set(String(partner.id), createdPartner.id);
        created += 1;
      }
    } else {
      if (existing) {
        idMaps.partners.set(String(partner.id), existing.id);
        refreshed += 1;
        skipped += 1;
      } else {
        created += 1;
      }
    }
  }

  console.log(`  Partners: ${created} created, ${refreshed} refreshed, ${skipped} matched`);
  setPhaseSummary("partners", created, skipped, 0, [`${refreshed} existing partners refreshed.`]);
}

async function migratePosts() {
  if (!runPhase("posts")) return;
  console.log("\n── Phase 6: Posts ──");

  interface OldPost {
    id: string | number;
    id_chuyenmuc?: string | number;
    tieude?: string;
    tieudeseo?: string;
    duongdan?: string;
    mieutangan?: string;
    mieutachitiet?: string;
    mieutaseo?: string;
    tukhoa?: string;
    anhdaidien?: string;
    noibat?: string | number;
    ngayvietbai?: string;
    luotxem?: string | number;
    luunhap?: string | number;
    stt_hienthi?: string | number;
  }

  const posts = toArray(readJson<OldPost[] | OldPost>("post.json"));
  const slugPool = new Set<string>((await prisma.post.findMany({ select: { slug: true } })).map((row) => row.slug));
  let created = 0;
  let skipped = 0;
  let refreshed = 0;
  let tagLinks = 0;

  for (const post of posts) {
    const title = normalizeWhitespace(nonEmptyString(post.tieude));
    if (!title) {
      skipped += 1;
      continue;
    }

    const categoryId = idMaps.categories.get(`post_${post.id_chuyenmuc}`);
    if (!categoryId) {
      skipped += 1;
      continue;
    }

    const rawSlug = nonEmptyString(post.duongdan) || slugify(title);
    const existing = await prisma.post.findFirst({
      where: {
        OR: [{ slug: rawSlug }, { title }],
      },
    });
    const slug = existing ? existing.slug : uniqueSlug(rawSlug || slugify(title), slugPool);
    const featuredImageId = await ensureMedia(nonEmptyString(post.anhdaidien), title);
    const isPublished = String(post.luunhap ?? "0") === "0";
    const publishedAt = isPublished && nonEmptyString(post.ngayvietbai)
      ? new Date(nonEmptyString(post.ngayvietbai))
      : isPublished
        ? new Date()
        : null;
    const payload = {
      title,
      slug,
      excerpt: stripHtml(nonEmptyString(post.mieutangan)) || null,
      content: cleanContent(nonEmptyString(post.mieutachitiet)) || "",
      featuredImageId,
      categoryId,
      authorId: adminUserId,
      type: "ORIGINAL",
      isFeatured: String(post.noibat ?? "0") === "1",
      isPublished,
      publishedAt,
      viewCount: Number(post.luotxem ?? 0) || 0,
      sortOrder: Number(post.stt_hienthi ?? 0) || 0,
      metaTitle: nonEmptyString(post.tieudeseo) || null,
      metaDescription: nonEmptyString(post.mieutaseo) || null,
    };

    let postId = existing?.id || null;
    if (!DRY_RUN) {
      if (existing) {
        await prisma.post.update({ where: { id: existing.id }, data: payload });
        refreshed += 1;
        skipped += 1;
      } else {
        const createdPost = await prisma.post.create({ data: payload });
        postId = createdPost.id;
        created += 1;
      }
    } else if (existing) {
      refreshed += 1;
      skipped += 1;
    } else {
      created += 1;
    }

    idMaps.posts.set(String(post.id), postId || `dry-post-${post.id}`);

    if (!postId || DRY_RUN) {
      continue;
    }

    const keywords = nonEmptyString(post.tukhoa)
      .split(",")
      .map((entry) => normalizeWhitespace(stripHtml(entry)))
      .filter(Boolean);

    for (const keyword of keywords) {
      const keywordSlug = slugify(keyword);
      if (!keywordSlug) continue;
      let tagId = idMaps.tags.get(keywordSlug) || null;
      if (!tagId) {
        const existingTag = await prisma.tag.findFirst({
          where: { OR: [{ slug: keywordSlug }, { name: keyword }] },
        });
        if (existingTag) {
          tagId = existingTag.id;
        } else {
          try {
            const createdTag = await prisma.tag.create({ data: { name: keyword, slug: keywordSlug } });
            tagId = createdTag.id;
          } catch {
            const fallbackTag = await prisma.tag.findFirst({ where: { slug: keywordSlug } });
            tagId = fallbackTag?.id || null;
          }
        }
        if (tagId) idMaps.tags.set(keywordSlug, tagId);
      }

      if (!tagId) continue;
      try {
        await prisma.postTag.upsert({
          where: { postId_tagId: { postId, tagId } },
          update: {},
          create: { postId, tagId },
        });
        tagLinks += 1;
      } catch {
        continue;
      }
    }
  }

  console.log(`  Posts: ${created} created, ${refreshed} refreshed, ${skipped} matched`);
  setPhaseSummary("posts", created, skipped, 0, [
    `${refreshed} existing posts refreshed.`,
    `${tagLinks} tag links created or retained.`,
  ]);
}

async function migrateCourses() {
  if (!runPhase("courses")) return;
  console.log("\n── Phase 7: Courses ──");

  interface OldCourse {
    id: string | number;
    id_chuyenmuc?: string | number;
    tieude?: string;
    tieudeseo?: string;
    duongdan?: string;
    mieutangan?: string;
    mieutachitiet?: string;
    mieutaseo?: string;
    anhdaidien?: string;
    noibat?: string | number;
    created_time?: string;
    luotxem?: string | number;
    luunhap?: string | number;
    stt_hienthi?: string | number;
    [key: string]: unknown;
  }

  const courses = toArray(readJson<OldCourse[] | OldCourse>("hosomoitruong.json"));
  const slugPool = new Set<string>((await prisma.course.findMany({ select: { slug: true } })).map((row) => row.slug));
  let created = 0;
  let skipped = 0;
  let refreshed = 0;
  let sectionsCreated = 0;

  for (const course of courses) {
    const title = normalizeWhitespace(nonEmptyString(course.tieude));
    if (!title) {
      skipped += 1;
      continue;
    }

    const rawSlug = nonEmptyString(course.duongdan) || slugify(title);
    const existing = await prisma.course.findFirst({ where: { OR: [{ slug: rawSlug }, { title }] } });
    const slug = existing ? existing.slug : uniqueSlug(rawSlug || slugify(title), slugPool);
    const featuredImageId = await ensureMedia(nonEmptyString(course.anhdaidien), title);
    const categoryId = idMaps.categories.get(`course_${course.id_chuyenmuc}`) || null;
    const isPublished = String(course.luunhap ?? "0") === "0";
    const publishedAt = isPublished && nonEmptyString(course.created_time)
      ? new Date(nonEmptyString(course.created_time))
      : isPublished
        ? new Date()
        : null;
    const payload = {
      title,
      slug,
      excerpt: stripHtml(nonEmptyString(course.mieutangan)) || null,
      featuredImageId,
      categoryId,
      type: "SHORT_COURSE",
      authorId: adminUserId,
      isFeatured: String(course.noibat ?? "0") === "1",
      isPublished,
      publishedAt,
      isRegistrationOpen: true,
      viewCount: Number(course.luotxem ?? 0) || 0,
      sortOrder: Number(course.stt_hienthi ?? 0) || 0,
      metaTitle: nonEmptyString(course.tieudeseo) || null,
      metaDescription: nonEmptyString(course.mieutaseo) || null,
    };

    let courseId = existing?.id || null;
    if (!DRY_RUN) {
      if (existing) {
        await prisma.course.update({ where: { id: existing.id }, data: payload });
        refreshed += 1;
        skipped += 1;
      } else {
        const createdCourse = await prisma.course.create({ data: payload });
        courseId = createdCourse.id;
        created += 1;
      }
    } else if (existing) {
      refreshed += 1;
      skipped += 1;
    } else {
      created += 1;
    }

    idMaps.courses.set(String(course.id), courseId || `dry-course-${course.id}`);

    if (!courseId || DRY_RUN) {
      sectionsCreated += buildTabbedSections(course).length;
      continue;
    }

    const sections = buildTabbedSections(course);
    const sectionKeys = sections.map((section) => section.sectionKey);
    await prisma.contentSection.deleteMany({
      where: {
        entityType: "COURSE",
        entityId: courseId,
        sectionKey: { notIn: sectionKeys.length > 0 ? sectionKeys : ["__none__"] },
      },
    });

    for (const section of sections) {
      await prisma.contentSection.upsert({
        where: {
          entityType_entityId_sectionKey: {
            entityType: "COURSE",
            entityId: courseId,
            sectionKey: section.sectionKey,
          },
        },
        update: {
          title: section.title,
          content: section.content,
          sortOrder: section.sortOrder,
          isActive: true,
        },
        create: {
          entityType: "COURSE",
          entityId: courseId,
          sectionKey: section.sectionKey,
          title: section.title,
          content: section.content,
          sortOrder: section.sortOrder,
          isActive: true,
        },
      });
    }
    sectionsCreated += sections.length;
  }

  console.log(`  Courses: ${created} created, ${refreshed} refreshed, ${skipped} matched`);
  setPhaseSummary("courses", created, skipped, 0, [
    `${refreshed} existing courses refreshed.`,
    `${sectionsCreated} COURSE content sections created or updated.`,
  ]);
}

async function migratePages() {
  if (!runPhase("pages")) return;
  console.log("\n── Phase 8: Pages ──");

  interface OldPage {
    id: string | number;
    tieude?: string;
    ten?: string;
    name_page?: string;
    slug?: string;
    duongdan?: string;
    noidung?: string;
    content?: string;
    anhdaidien?: string;
    stt_hienthi?: string | number;
    trangthai?: string | number;
    tieudeseo?: string;
    mieutaseo?: string;
  }

  const pages = toArray(readJson<OldPage[] | OldPage>("page_all.json"));
  const slugPool = new Set<string>((await prisma.page.findMany({ select: { slug: true } })).map((row) => row.slug));
  let created = 0;
  let skipped = 0;
  let refreshed = 0;

  for (const page of pages) {
    const title = normalizeWhitespace(firstNonEmpty(page.tieude, page.ten, page.name_page));
    if (!title) {
      skipped += 1;
      continue;
    }

    const rawSlug = firstNonEmpty(page.slug, page.duongdan, slugify(title));
    const existing = await prisma.page.findFirst({
      where: {
        slug: rawSlug,
      },
    });
    const slug = existing ? existing.slug : uniqueSlug(rawSlug || slugify(title), slugPool);
    const featuredImageId = await ensureMedia(nonEmptyString(page.anhdaidien), title);
    const payload = {
      title,
      slug,
      content: cleanContent(firstNonEmpty(page.noidung, page.content)),
      featuredImageId,
      template: existing?.template || "default",
      authorId: adminUserId,
      isPublished: String(page.trangthai ?? "1") !== "0",
      sortOrder: Number(page.stt_hienthi ?? 0) || 0,
      metaTitle: nonEmptyString(page.tieudeseo) || null,
      metaDescription: nonEmptyString(page.mieutaseo) || null,
    };

    if (!DRY_RUN) {
      if (existing) {
        await prisma.page.update({ where: { id: existing.id }, data: payload });
        idMaps.pages.set(String(page.id), existing.id);
        refreshed += 1;
        skipped += 1;
      } else {
        const createdPage = await prisma.page.create({ data: payload });
        idMaps.pages.set(String(page.id), createdPage.id);
        created += 1;
      }
    } else {
      if (existing) {
        idMaps.pages.set(String(page.id), existing.id);
        refreshed += 1;
        skipped += 1;
      } else {
        created += 1;
      }
    }
  }

  console.log(`  Pages: ${created} created, ${refreshed} refreshed, ${skipped} matched`);
  setPhaseSummary("pages", created, skipped, 0, [`${refreshed} existing static pages refreshed.`]);
}

async function migrateConfigurations() {
  if (!runPhase("config")) return;
  console.log("\n── Phase 9: Configurations ──");

  const rawConfigs = toArray(readJson<JsonRecord[] | JsonRecord>("configurations.json"));
  const rawSiteInfo = toArray(readJson<JsonRecord[] | JsonRecord>("info_website.json"));
  const adHocEntries = [...rawConfigs, ...rawSiteInfo];
  const normalizedSeeds = buildNormalizedConfigurationSeeds();
  const keysHandled = new Set<string>();
  let created = 0;
  let skipped = 0;
  let refreshed = 0;

  for (const seed of normalizedSeeds) {
    keysHandled.add(seed.key);
    const existing = await prisma.configuration.findFirst({ where: { key: seed.key } });
    if (!DRY_RUN) {
      await prisma.configuration.upsert({
        where: { key: seed.key },
        update: {
          value: seed.value,
          type: "STRING",
          group: seed.group,
        },
        create: {
          key: seed.key,
          value: seed.value,
          type: "STRING",
          group: seed.group,
        },
      });
    }

    if (existing) {
      refreshed += 1;
      skipped += 1;
    } else {
      created += 1;
    }
  }

  for (const entry of adHocEntries) {
    const key = normalizeWhitespace(firstNonEmpty(entry.key, entry.ten, entry.name));
    const value = normalizeWhitespace(firstNonEmpty(entry.value, entry.giatri));
    if (!key || !value || keysHandled.has(key)) {
      skipped += 1;
      continue;
    }

    keysHandled.add(key);
    const existing = await prisma.configuration.findFirst({ where: { key } });
    if (!DRY_RUN) {
      await prisma.configuration.upsert({
        where: { key },
        update: {
          value,
          type: "STRING",
          group: firstNonEmpty(entry.nhom, entry.group, "general"),
        },
        create: {
          key,
          value,
          type: "STRING",
          group: firstNonEmpty(entry.nhom, entry.group, "general"),
        },
      });
    }

    if (existing) {
      refreshed += 1;
      skipped += 1;
    } else {
      created += 1;
    }
  }

  console.log(`  Configurations: ${created} created, ${refreshed} refreshed, ${skipped} matched`);
  setPhaseSummary("config", created, skipped, 0, [`${refreshed} normalized configuration rows refreshed.`]);
}

async function migrateMenuItems() {
  if (!runPhase("menus")) return;
  console.log("\n── Phase 10: Menu Items ──");

  interface OldMenuItem {
    id: string | number;
    tenmenu?: string;
    label?: string;
    tukhoa?: string;
    url?: string;
    duongdan?: string;
    id_cha?: string | number;
    stt_hienthi?: string | number;
    trangthai?: string | number;
  }

  const sources = [
    { filename: "menu.json", group: "main", activate: true },
    { filename: "menufooter.json", group: "footer1", activate: false },
    { filename: "menufooter2.json", group: "footer2", activate: false },
    { filename: "menufooter3.json", group: "footer3", activate: false },
    { filename: "menufooter4.json", group: "footer4", activate: false },
  ];

  pushUnique(
    menuWarnings,
    "Footer menu variants are stored as inactive rows because the MenuItem schema has no menu-group field.",
  );

  const stagedItems: Array<{
    sourceKey: string;
    parentSourceKey: string | null;
    label: string;
    label_en: string | null;
    url: string;
    target: "_self" | "_blank";
    sortOrder: number;
    isActive: boolean;
    lookupUrls: string[];
  }> = [];
  const sourceToId = new Map<string, string>();
  let created = 0;
  let skipped = 0;
  let parentLinksApplied = 0;
  let refreshed = 0;

  for (const source of sources) {
    const rows = toArray(readJson<OldMenuItem[] | OldMenuItem>(source.filename));
    for (const row of rows) {
      const rawLabel = normalizeMenuLabel(firstNonEmpty(row.tenmenu, row.label, row.tukhoa));
      if (!rawLabel || isPlaceholderMenuLabel(rawLabel)) {
        skipped += 1;
        continue;
      }

      const { url, target } = resolveMenuUrls(firstNonEmpty(row.url, row.duongdan, "#"));
      const labels = resolveMenuLabels(rawLabel, url);
      stagedItems.push({
        sourceKey: `${source.group}:${String(row.id)}`,
        parentSourceKey: String(row.id_cha ?? "").trim() ? `${source.group}:${String(row.id_cha)}` : null,
        label: labels.label,
        label_en: labels.label_en,
        url,
        target,
        sortOrder: Number(row.stt_hienthi ?? 0) || stagedItems.length,
        isActive: source.activate ? String(row.trangthai ?? "1") !== "0" : false,
        lookupUrls: Array.from(new Set([
          firstNonEmpty(row.url, row.duongdan, "#"),
          normalizePath(firstNonEmpty(row.url, row.duongdan, "#")),
          normalizeLegacyInternalPath(firstNonEmpty(row.url, row.duongdan, "#")),
          url,
        ].filter(Boolean))),
      });
    }
  }

  for (const item of stagedItems) {
    const existing = await prisma.menuItem.findFirst({
      where: {
        locale: "VI",
        OR: [
          {
            label: item.label,
            url: { in: item.lookupUrls },
          },
          {
            url: { in: item.lookupUrls },
          },
        ],
      },
    });

    if (existing && !item.isActive && existing.isActive) {
      sourceToId.set(item.sourceKey, existing.id);
      skipped += 1;
      continue;
    }

    if (!DRY_RUN) {
      if (existing) {
        await prisma.menuItem.update({
          where: { id: existing.id },
          data: {
            label: item.label,
            label_en: item.label_en,
            url: item.url,
            locale: "VI",
            target: item.target,
            sortOrder: item.sortOrder,
            isActive: item.isActive,
          },
        });
        sourceToId.set(item.sourceKey, existing.id);
        refreshed += 1;
        skipped += 1;
      } else {
        const createdItem = await prisma.menuItem.create({
          data: {
            label: item.label,
            label_en: item.label_en,
            url: item.url,
            locale: "VI",
            target: item.target,
            sortOrder: item.sortOrder,
            isActive: item.isActive,
          },
        });
        sourceToId.set(item.sourceKey, createdItem.id);
        created += 1;
      }
    } else {
      sourceToId.set(item.sourceKey, existing?.id || `dry-menu-${item.sourceKey}`);
      if (existing) {
        refreshed += 1;
        skipped += 1;
      } else {
        created += 1;
      }
    }
  }

  for (const item of stagedItems) {
    if (!item.parentSourceKey) continue;
    const childId = sourceToId.get(item.sourceKey);
    const parentId = sourceToId.get(item.parentSourceKey);

    if (!childId) continue;
    if (!parentId) {
      pushUnique(menuWarnings, `Missing parent menu id "${item.parentSourceKey}" for "${item.label}".`);
      continue;
    }

    if (!DRY_RUN && !childId.startsWith("dry-")) {
      await prisma.menuItem.update({
        where: { id: childId },
        data: { parentId },
      });
    }
    parentLinksApplied += 1;
  }

  for (const item of stagedItems) {
    if (item.target === "_self" && item.url !== "#" && !resolveEquivalentEnPath(item.url)) {
      pushUnique(menuWarnings, `No English route mapping found for menu path "${item.url}" (${item.label}).`);
    }
  }

  console.log(`  Menu items: ${created} created, ${refreshed} refreshed, ${skipped} matched`);
  setPhaseSummary("menus", created, skipped, 0, [
    `${refreshed} existing menu items refreshed.`,
    `${parentLinksApplied} parent-child relationships applied.`,
    `${menuWarnings.length} menu normalization warnings recorded.`,
  ]);
}

async function migrateServices() {
  if (!runPhase("services")) return;
  console.log("\n── Phase 11: Services ──");

  interface OldService {
    id: string | number;
    tieude?: string;
    tieudeseo?: string;
    duongdan?: string;
    mieutangan?: string;
    mieutachitiet?: string;
    mieutaseo?: string;
    anhdaidien?: string;
    luotxem?: string | number;
    noibat?: string | number;
    stt_hienthi?: string | number;
    [key: string]: unknown;
  }

  const services = toArray(readJson<OldService[] | OldService>("service.json"));
  const slugPool = new Set<string>(
    (await prisma.page.findMany({ where: { template: "service" }, select: { slug: true } })).map((row) => row.slug),
  );
  let created = 0;
  let skipped = 0;
  let refreshed = 0;
  let sectionsCreated = 0;

  for (const service of services) {
    const title = normalizeWhitespace(nonEmptyString(service.tieude));
    if (!title) {
      skipped += 1;
      continue;
    }

    const rawSlug = nonEmptyString(service.duongdan) || slugify(title);
    const existing = await prisma.page.findFirst({
      where: {
        template: "service",
        OR: [{ slug: rawSlug }, { title }],
      },
    });
    const slug = existing ? existing.slug : uniqueSlug(rawSlug || slugify(title), slugPool);
    const featuredImageId = await ensureMedia(nonEmptyString(service.anhdaidien), title);
    const pageContent = cleanContent(firstNonEmpty(service.mieutachitiet, service.mieutangan));
    const payload = {
      title,
      slug,
      content: pageContent,
      featuredImageId,
      template: "service",
      authorId: adminUserId,
      isPublished: true,
      sortOrder: Number(service.stt_hienthi ?? 0) || 0,
      metaTitle: nonEmptyString(service.tieudeseo) || title,
      metaDescription: nonEmptyString(service.mieutaseo) || stripHtml(nonEmptyString(service.mieutangan)) || null,
    };

    let pageId = existing?.id || null;
    if (!DRY_RUN) {
      if (existing) {
        await prisma.page.update({ where: { id: existing.id }, data: payload });
        pageId = existing.id;
        refreshed += 1;
        skipped += 1;
      } else {
        const createdPage = await prisma.page.create({ data: payload });
        pageId = createdPage.id;
        created += 1;
      }
    } else if (existing) {
      pageId = existing.id;
      refreshed += 1;
      skipped += 1;
    } else {
      pageId = `dry-service-${service.id}`;
      created += 1;
    }

    idMaps.services.set(String(service.id), pageId);

    const sections = buildTabbedSections(service);
    sectionsCreated += sections.length;
    if (!pageId || DRY_RUN || pageId.startsWith("dry-")) {
      continue;
    }

    const sectionKeys = sections.map((section) => section.sectionKey);
    await prisma.contentSection.deleteMany({
      where: {
        entityType: "SERVICE",
        entityId: pageId,
        sectionKey: { notIn: sectionKeys.length > 0 ? sectionKeys : ["__none__"] },
      },
    });

    for (const section of sections) {
      await prisma.contentSection.upsert({
        where: {
          entityType_entityId_sectionKey: {
            entityType: "SERVICE",
            entityId: pageId,
            sectionKey: section.sectionKey,
          },
        },
        update: {
          title: section.title,
          content: section.content,
          sortOrder: section.sortOrder,
          isActive: true,
        },
        create: {
          entityType: "SERVICE",
          entityId: pageId,
          sectionKey: section.sectionKey,
          title: section.title,
          content: section.content,
          sortOrder: section.sortOrder,
          isActive: true,
        },
      });
    }
  }

  console.log(`  Services: ${created} created, ${refreshed} refreshed, ${skipped} matched`);
  setPhaseSummary("services", created, skipped, 0, [
    `${refreshed} existing service pages refreshed.`,
    `${sectionsCreated} SERVICE content sections created or updated.`,
  ]);
}

async function migrateReviews() {
  if (!runPhase("reviews")) return;
  console.log("\n── Phase 12: Reviews ──");

  interface OldReview {
    id: string | number;
    name?: string;
    chucvu?: string;
    mieutangan?: string;
    anhdaidien?: string;
  }

  const buildReviewKey = (name: string, role: string, company: string, content: string) =>
    [name, role, company, content].map((value) => normalizeWhitespace(stripHtml(value)).toLowerCase()).join("|");

  const existingReviews = await prisma.review.findMany({
    select: { id: true, name: true, role: true, company: true, content: true },
  });
  const existingByKey = new Map(
    existingReviews.map((review) => [
      buildReviewKey(review.name, review.role || "", review.company || "", review.content),
      review.id,
    ]),
  );

  const reviews = toArray(readJson<OldReview[] | OldReview>("feel.json"));
  let created = 0;
  let skipped = 0;
  let refreshed = 0;
  let missingRemoteAvatars = 0;

  for (const review of reviews) {
    const name = normalizeWhitespace(nonEmptyString(review.name));
    const role = normalizeWhitespace(nonEmptyString(review.chucvu));
    const content = normalizeWhitespace(nonEmptyString(review.mieutangan));
    if (!name || !content) {
      skipped += 1;
      continue;
    }

    const avatarId = await ensureMedia(nonEmptyString(review.anhdaidien), `${name} avatar`);
    if (!avatarId && nonEmptyString(review.anhdaidien).startsWith("/uploads/")) {
      missingRemoteAvatars += 1;
    }

    const reviewKey = buildReviewKey(name, role, "", content);
    const existingId = existingByKey.get(reviewKey);

    if (!DRY_RUN) {
      if (existingId) {
        await prisma.review.update({
          where: { id: existingId },
          data: {
            name,
            role: role || null,
            company: null,
            content,
            avatarId,
            rating: 5,
            sortOrder: refreshed + created,
            isActive: true,
          },
        });
        refreshed += 1;
        skipped += 1;
      } else {
        const createdReview = await prisma.review.create({
          data: {
            name,
            role: role || null,
            company: null,
            content,
            avatarId,
            rating: 5,
            sortOrder: refreshed + created,
            isActive: true,
          },
        });
        existingByKey.set(reviewKey, createdReview.id);
        created += 1;
      }
    } else if (existingId) {
      refreshed += 1;
      skipped += 1;
    } else {
      created += 1;
    }
  }

  if (missingRemoteAvatars > 0) {
    pushUnique(
      reviewWarnings,
      `${missingRemoteAvatars} reviews reference local /uploads avatars and were imported without remote avatar media.`,
    );
  }

  console.log(`  Reviews: ${created} created, ${refreshed} refreshed, ${skipped} matched`);
  setPhaseSummary("reviews", created, skipped, 0, [
    `${refreshed} existing reviews refreshed.`,
    `${reviewWarnings.length} review warnings recorded.`,
  ]);
}

async function migrateHomepageSections() {
  if (!runPhase("homepage")) return;
  console.log("\n── Phase 13: Homepage Sections ──");

  interface LegacyHomepageToggle {
    id: string | number;
    status?: string | number;
    statusmb?: string | number;
  }

  interface LegacyVideoRecord {
    id: string | number;
    tieude?: string;
    anhdaidien?: string;
    video_youtube?: string;
    video_home?: string;
  }

  interface LegacyGalleryRecord {
    id: string | number;
    gallery_image?: string;
  }

  const profile = getLegacyInstitutionProfile();
  const toggleRows = toArray(readJson<LegacyHomepageToggle[] | LegacyHomepageToggle>("space_module_home.json"));
  const toggleById = new Map(toggleRows.map((row) => [Number(row.id), row]));
  const videoRows = toArray(readJson<LegacyVideoRecord[] | LegacyVideoRecord>("module_video_home.json"));
  const galleryRows = toArray(readJson<LegacyGalleryRecord[] | LegacyGalleryRecord>("module_images.json"));

  const galleryImages = (galleryRows.find((row) => String(row.id) === "1")?.gallery_image || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((url) => {
      if (url.startsWith("/uploads/")) {
        unresolvedAssetPaths.add(url);
        return false;
      }
      return url.startsWith("http");
    })
    .map((url, index) => ({
      id: `gallery-${index + 1}`,
      url,
      alt: `Hoạt động Viện Phương Nam ${index + 1}`,
    }));

  const videos = videoRows
    .map((row, index) => {
      const source = firstNonEmpty(row.video_home, row.video_youtube);
      if (!source) return null;

      const youtubeUrl = source.startsWith("http") ? source : `https://www.youtube.com/watch?v=${source}`;
      const thumbnailUrl = nonEmptyString(row.anhdaidien).startsWith("/uploads/")
        ? ""
        : nonEmptyString(row.anhdaidien) || (nonEmptyString(row.video_youtube)
          ? `https://img.youtube.com/vi/${nonEmptyString(row.video_youtube)}/hqdefault.jpg`
          : "");

      return {
        id: `video-${row.id}`,
        title: normalizeWhitespace(stripHtml(nonEmptyString(row.tieude))) || `Video ${index + 1}`,
        thumbnailUrl,
        videoUrl: youtubeToEmbed(youtubeUrl),
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  let created = 0;
  let skipped = 0;
  let refreshed = 0;

  for (const section of CANONICAL_HOMEPAGE_SECTIONS) {
    const defaults = HOMEPAGE_DEFAULTS[section.key];
    const toggle = toggleById.get(section.legacyId);
    if (!defaults) {
      pushUnique(homepageWarnings, `Missing homepage defaults for section "${section.key}".`);
      skipped += 1;
      continue;
    }

    const config = { ...defaults.config };
    if (section.key === "video") {
      config.videos = videos;
    }
    if (section.key === "gallery") {
      config.images = galleryImages;
    }
    if (section.key === "hero" && videos.length > 0) {
      config.featuredVideo = {
        eyebrow: "Video nổi bật",
        title: videos[0].title,
        description: defaults.subtitle,
        thumbnailUrl: videos[0].thumbnailUrl,
        href: "/#video",
      };
    }
    if (section.key === "contact") {
      config.address = profile.address;
      config.phone = profile.phonePrimary;
      config.email = profile.email;
      config.hours = "Liên hệ trước để được sắp xếp lịch làm việc phù hợp.";
    }
    if (section.key === "cta") {
      config.phone = profile.phonePrimary;
      config.email = profile.email;
    }

    const isEnabled = toggle
      ? inferLegacyEnabled(toggle.status) || inferLegacyEnabled(toggle.statusmb)
      : true;

    const existing = await prisma.homepageSection.findFirst({
      where: {
        sectionKey: section.key,
        locale: "VI",
      },
    });

    if (!DRY_RUN) {
      await prisma.homepageSection.upsert({
        where: {
          sectionKey_locale: {
            sectionKey: section.key,
            locale: "VI",
          },
        },
        update: {
          title: defaults.title,
          subtitle: defaults.subtitle,
          isEnabled,
          sortOrder: (section.legacyId - 1) * 10,
          config: JSON.stringify(config),
        },
        create: {
          sectionKey: section.key,
          locale: "VI",
          title: defaults.title,
          subtitle: defaults.subtitle,
          isEnabled,
          sortOrder: (section.legacyId - 1) * 10,
          config: JSON.stringify(config),
        },
      });
    }

    importedHomepageSectionKeys.add(section.key);
    if (existing) {
      refreshed += 1;
      skipped += 1;
    } else {
      created += 1;
    }

    if (!toggle) {
      pushUnique(
        homepageWarnings,
        `No legacy toggle row found for homepage section "${section.key}" (legacy id ${section.legacyId}).`,
      );
    }
  }

  const canonicalIds = new Set(CANONICAL_HOMEPAGE_SECTIONS.map((section) => section.legacyId));
  for (const row of toggleRows) {
    const legacyId = Number(row.id);
    if (canonicalIds.has(legacyId)) continue;
    deferredHomepageModuleIds.add(legacyId);
    pushUnique(homepageWarnings, `Deferred legacy homepage module id ${legacyId}; no canonical section mapping exists.`);
  }

  console.log(`  Homepage sections: ${created} created, ${refreshed} refreshed, ${skipped} matched`);
  setPhaseSummary("homepage", created, skipped, 0, [
    `${refreshed} existing homepage sections refreshed.`,
    `${videos.length} video records mapped into the video section.`,
    `${galleryImages.length} gallery images mapped into the gallery section config.`,
    `${homepageWarnings.length} homepage warnings recorded.`,
  ]);
}

async function migrateGalleryMedia() {
  if (!runPhase("gallery")) return;
  console.log("\n── Phase 14: Gallery Media ──");

  interface ModuleImageRecord {
    id: string | number;
    gallery_image?: string;
  }

  const records = toArray(readJson<ModuleImageRecord[] | ModuleImageRecord>("module_images.json"));
  const galleryRecord = records.find((record) => String(record.id) === "1");
  if (!galleryRecord?.gallery_image) {
    console.log("  No gallery_image data found in module_images.json");
    setPhaseSummary("gallery", 0, 0, 0, ["No gallery image payload present in module_images.json."]);
    return;
  }

  const urls = galleryRecord.gallery_image
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  let created = 0;
  let skipped = 0;

  for (const url of urls) {
    if (url.startsWith("/uploads/")) {
      unresolvedAssetPaths.add(url);
      continue;
    }
    if (!url.startsWith("http")) continue;

    const hadExistingMedia = idMaps.media.has(url);
    const mediaId = await ensureMedia(url, "Ảnh thư viện - Viện Phương Nam", "gallery");
    if (mediaId && mediaId !== "dry-run-media-id" && hadExistingMedia) {
      skipped += 1;
    } else if (mediaId) {
      created += 1;
    }
  }

  console.log(`  Gallery media: ${created} created, ${skipped} matched`);
  setPhaseSummary("gallery", created, skipped, 0, [`${unresolvedAssetPaths.size} unresolved local asset paths recorded.`]);
}

async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  JSON → Prisma DB Migration (d7a8)          ║");
  if (DRY_RUN) console.log("║  MODE: DRY RUN (no writes)                  ║");
  if (WIPE) console.log("║  MODE: WIPE ENABLED                         ║");
  if (AUDIT_ONLY) console.log("║  MODE: AUDIT ONLY                           ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  validatePhaseSelection(phaseArg);

  const preflightReport = buildPreflightReport(phaseArg);
  const auditReportPath = writeJsonReport("migration-audit.json", preflightReport);
  console.log(`Audit report written to: ${auditReportPath}`);

  if (!fs.existsSync(JSON_DIR)) {
    throw new Error(`JSON source directory not found: ${JSON_DIR}`);
  }

  if (preflightReport.missingRequiredFiles.length > 0) {
    for (const missing of preflightReport.missingRequiredFiles) {
      console.error(`✗ Missing required file for phase "${missing.phase}": ${missing.file}`);
    }
    process.exit(1);
  }

  if (WIPE && !CONFIRM_WIPE) {
    console.error("✗ Refusing to wipe without --confirm-wipe.");
    process.exit(1);
  }

  if (AUDIT_ONLY) {
    console.log("Audit-only mode complete.");
    return;
  }

  await ensureSystemUser();

  if (WIPE && !DRY_RUN) {
    await wipeAll();
    await ensureSystemUser();
  }

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
  await migrateServices();
  await migrateReviews();
  await migrateHomepageSections();
  await migrateGalleryMedia();

  const runReport: RunReport = {
    generatedAt: new Date().toISOString(),
    mode: AUDIT_ONLY ? "audit-only" : DRY_RUN ? "dry-run" : "apply",
    selectedPhase: phaseArg,
    jsonDir: JSON_DIR,
    activePhases: getActivePhases(phaseArg),
    unresolvedAssetPaths: Array.from(unresolvedAssetPaths).sort(),
    warnings: {
      menus: [...menuWarnings].sort(),
      reviews: [...reviewWarnings].sort(),
      homepage: [...homepageWarnings].sort(),
    },
    homepageSectionCoverage: {
      importedKeys: Array.from(importedHomepageSectionKeys).sort(),
      deferredModuleIds: Array.from(deferredHomepageModuleIds).sort((a, b) => a - b),
    },
    phaseSummaries,
  };

  const runReportPath = writeJsonReport("migration-run-report.json", runReport);
  console.log(`Run report written to: ${runReportPath}`);
}

main()
  .catch((error) => {
    console.error("\n✗ Migration failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
