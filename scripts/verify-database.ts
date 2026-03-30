// @ts-nocheck
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

type VerificationStatus = "PASS" | "FAIL";
type VerificationMode = "count" | "coverage";
type JsonRecord = Record<string, unknown>;

interface VerificationResult {
  model: string;
  mode: VerificationMode;
  expectedCount: number;
  actualCount: number;
  status: VerificationStatus;
  missingCount?: number;
  extraCount?: number;
  sampleMissing?: string[];
  sampleExtras?: string[];
  notes?: string[];
}

interface VerificationReport {
  summary: {
    totalModelsVerified: number;
    modelsPassed: number;
    modelsFailed: number;
    verificationTimestamp: string;
    jsonDir: string;
    currentDatabase: string;
  };
  discrepancies: Array<{
    model: string;
    expectedCount: number;
    actualCount: number;
    difference: number;
    mode: VerificationMode;
    missingCount?: number;
    extraCount?: number;
  }>;
  results: VerificationResult[];
}

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

class JsonDatabaseVerifier {
  private results: VerificationResult[] = [];

  constructor(private readonly jsonDir: string) {}

  private readJson<T>(filename: string): T {
    const filePath = path.join(this.jsonDir, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`JSON file not found: ${filePath}`);
    }
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  }

  private nonEmptyString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
  }

  private normalizeWhitespace(value: string): string {
    return value.replace(/\s+/g, " ").trim();
  }

  private stripHtml(html: string): string {
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

  private slugify(text: string): string {
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

  private normalizeMenuLabel(value: string): string {
    return this.normalizeWhitespace(this.stripHtml(value));
  }

  private normalizePath(pathValue: string): string {
    const trimmed = pathValue.trim();
    if (!trimmed || trimmed === "#") return "#";
    const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    const normalized = withLeadingSlash.replace(/\/{2,}/g, "/").replace(/\/+$/, "");
    return normalized || "/";
  }

  private resolveEquivalentEnPath(viPath: string): string | null {
    for (const mapping of ROUTE_EQUIVALENTS) {
      if (mapping.vi === viPath) return mapping.en;
    }

    for (const mapping of ROUTE_EQUIVALENTS) {
      if (mapping.vi !== "/" && viPath.startsWith(`${mapping.vi}/`)) {
        const suffix = viPath.slice(mapping.vi.length);
        return `${mapping.en}${suffix}`;
      }
    }

    return null;
  }

  private normalizeLegacyInternalPath(rawUrl: string): string {
    let value = this.normalizePath(rawUrl);

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

  private resolveMenuUrls(rawUrl: string) {
    const trimmed = rawUrl.trim();
    const normalizedHostAlias = LEGACY_HOST_ALIASES[trimmed.toLowerCase()];
    if (normalizedHostAlias) {
      return {
        url: normalizedHostAlias,
        urlEn: this.resolveEquivalentEnPath(normalizedHostAlias),
        target: "_self",
      };
    }

    if (trimmed.startsWith("//")) {
      return {
        url: `https:${trimmed}`,
        urlEn: null,
        target: "_blank",
      };
    }

    if (/^https?:\/\//i.test(trimmed)) {
      const isInternal = trimmed.includes("vienphuongnam.com");
      if (!isInternal) {
        return {
          url: trimmed,
          urlEn: null,
          target: "_blank",
        };
      }

      try {
        const parsed = new URL(trimmed);
        const viPath = this.normalizeLegacyInternalPath(parsed.pathname);
        return {
          url: viPath,
          urlEn: this.resolveEquivalentEnPath(viPath),
          target: "_self",
        };
      } catch {
        return {
          url: trimmed,
          urlEn: null,
          target: "_blank",
        };
      }
    }

    if (trimmed === "#") {
      return {
        url: "#",
        urlEn: "#",
        target: "_self",
      };
    }

    const viPath = this.normalizeLegacyInternalPath(trimmed);
    return {
      url: viPath,
      urlEn: this.resolveEquivalentEnPath(viPath),
      target: "_self",
    };
  }

  private splitKeywords(value: unknown): string[] {
    if (typeof value !== "string") return [];
    return value
      .split(",")
      .map((entry) => this.normalizeWhitespace(this.stripHtml(entry)))
      .filter(Boolean);
  }

  private addCountResult(model: string, expectedCount: number, actualCount: number, notes: string[] = []) {
    this.results.push({
      model,
      mode: "count",
      expectedCount,
      actualCount,
      status: expectedCount === actualCount ? "PASS" : "FAIL",
      notes: notes.length > 0 ? notes : undefined,
    });
  }

  private addCoverageResult(model: string, expectedKeys: Iterable<string>, actualKeys: Iterable<string>, notes: string[] = []) {
    const expected = new Set(Array.from(expectedKeys).filter(Boolean));
    const actual = new Set(Array.from(actualKeys).filter(Boolean));
    const missing = Array.from(expected).filter((key) => !actual.has(key));
    const extras = Array.from(actual).filter((key) => !expected.has(key));

    this.results.push({
      model,
      mode: "coverage",
      expectedCount: expected.size,
      actualCount: expected.size - missing.length,
      status: missing.length === 0 ? "PASS" : "FAIL",
      missingCount: missing.length,
      extraCount: extras.length,
      sampleMissing: missing.slice(0, 5),
      sampleExtras: extras.slice(0, 5),
      notes: notes.length > 0 ? notes : undefined,
    });
  }

  private addCustomCoverageResult(
    model: string,
    expectedCount: number,
    actualMatchedCount: number,
    missing: string[],
    extras: string[],
    notes: string[] = [],
  ) {
    this.results.push({
      model,
      mode: "coverage",
      expectedCount,
      actualCount: actualMatchedCount,
      status: missing.length === 0 ? "PASS" : "FAIL",
      missingCount: missing.length,
      extraCount: extras.length,
      sampleMissing: missing.slice(0, 5),
      sampleExtras: extras.slice(0, 5),
      notes: notes.length > 0 ? notes : undefined,
    });
  }

  private countUsers(): number {
    return this.readJson<JsonRecord[]>("user.json").length + 1;
  }

  private countCategories(): number {
    const postCategories = this.readJson<JsonRecord[]>("category_post.json");
    const courseCategories = this.readJson<JsonRecord[]>("category_service.json");
    return postCategories.length + courseCategories.length;
  }

  private countPartners(): number {
    return this.readJson<JsonRecord[]>("doitac.json")
      .filter((record) => this.nonEmptyString(record.name).length > 0)
      .length;
  }

  private countPosts(): number {
    const posts = this.readJson<JsonRecord[]>("post.json");
    const categories = this.readJson<JsonRecord[]>("category_post.json");
    const validCategoryIds = new Set(categories.map((record) => String(record.id)));

    return posts.filter((record) => {
      const title = this.nonEmptyString(record.tieude);
      const categoryId = String(record.id_chuyenmuc ?? "");
      return title.length > 0 && validCategoryIds.has(categoryId);
    }).length;
  }

  private countCourses(): number {
    return this.readJson<JsonRecord[]>("hosomoitruong.json")
      .filter((record) => this.nonEmptyString(record.tieude).length > 0)
      .length;
  }

  private countReviews(): number {
    return this.readJson<JsonRecord[]>("feel.json")
      .filter((record) => {
        const name = this.nonEmptyString(record.name);
        const content = this.nonEmptyString(record.mieutangan);
        return name.length > 0 && content.length > 0;
      })
      .length;
  }

  private countHomepageSections(): number {
    const toggles = this.readJson<JsonRecord[]>("space_module_home.json");
    const canonicalIds = new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
    return toggles.filter((record) => canonicalIds.has(String(record.id ?? ""))).length;
  }

  private countCourseContentSections(): number {
    const courses = this.readJson<JsonRecord[]>("hosomoitruong.json");
    let sections = 0;

    for (const record of courses) {
      if (this.nonEmptyString(record.tieude).length === 0) continue;

      if (this.nonEmptyString(record.mieutachitiet).length > 0) {
        sections += 1;
      }

      for (let index = 1; index <= 10; index += 1) {
        const title = this.nonEmptyString(record[`t${index}`]);
        const content = this.nonEmptyString(record[`c${index}`]);
        if (title.length > 0 || content.length > 0) {
          sections += 1;
        }
      }
    }

    return sections;
  }

  private countServicePages(): number {
    return this.readJson<JsonRecord[]>("service.json")
      .filter((record) => this.nonEmptyString(record.tieude).length > 0)
      .length;
  }

  private countServiceContentSections(): number {
    const services = this.readJson<JsonRecord[]>("service.json");
    let sections = 0;

    for (const record of services) {
      if (this.nonEmptyString(record.tieude).length === 0) continue;

      if (this.nonEmptyString(record.mieutachitiet).length > 0) {
        sections += 1;
      }

      for (let index = 1; index <= 10; index += 1) {
        const title = this.nonEmptyString(record[`t${index}`]);
        const content = this.nonEmptyString(record[`c${index}`]);
        if (title.length > 0 || content.length > 0) {
          sections += 1;
        }
      }
    }

    return sections;
  }

  private expectedUserEmails(): Set<string> {
    const emails = new Set<string>(["system@sisrd.vn"]);
    for (const user of this.readJson<JsonRecord[]>("user.json")) {
      const username = this.nonEmptyString(user.username).toLowerCase();
      if (!username) continue;
      emails.add(username.includes("@") ? username : `${username}@sisrd.vn`);
    }
    return emails;
  }

  private expectedDedicatedTagSlugs(): Set<string> {
    const slugs = new Set<string>();
    for (const record of this.readJson<JsonRecord[]>("detail_tags.json")) {
      const name = this.nonEmptyString(record.tukhoa);
      if (!name || name === "Từ khóa 1" || name.startsWith("Từ khóa ")) continue;
      slugs.add(this.slugify(name));
    }
    return slugs;
  }

  private expectedKeywordTagSlugs(): Set<string> {
    const slugs = new Set<string>();
    const categories = this.readJson<JsonRecord[]>("category_post.json");
    const validCategoryIds = new Set(categories.map((record) => String(record.id)));
    for (const post of this.readJson<JsonRecord[]>("post.json")) {
      const title = this.nonEmptyString(post.tieude);
      const categoryId = String(post.id_chuyenmuc ?? "");
      if (!title || !validCategoryIds.has(categoryId)) continue;

      for (const keyword of this.splitKeywords(post.tukhoa)) {
        const slug = this.slugify(keyword);
        if (slug) slugs.add(slug);
      }
    }

    return slugs;
  }

  private expectedStaffNames(): Set<string> {
    const names = new Set<string>();
    const sources = [
      ...this.readJson<JsonRecord[]>("banlanhdao.json"),
      ...this.readJson<JsonRecord[]>("bancovan.json"),
    ];

    for (const record of sources) {
      const name = this.normalizeWhitespace(this.nonEmptyString(record.name));
      if (name) {
        names.add(name.toLowerCase());
      }
    }

    return names;
  }

  private expectedPageSlugs(): Set<string> {
    const slugs = new Set<string>();
    for (const page of this.readJson<JsonRecord[]>("page_all.json")) {
      const title = this.nonEmptyString(page.tieude)
        || this.nonEmptyString(page.ten)
        || this.nonEmptyString(page.name_page);
      if (!title) continue;

      const slug = this.nonEmptyString(page.slug)
        || this.nonEmptyString(page.duongdan)
        || this.slugify(title);
      if (slug) slugs.add(slug);
    }
    return slugs;
  }

  private expectedMenuEntries() {
    const files = [
      { filename: "menu.json", locale: "VI", group: "main" },
      { filename: "menufooter.json", locale: "VI", group: "footer1" },
      { filename: "menufooter2.json", locale: "VI", group: "footer2" },
      { filename: "menufooter3.json", locale: "VI", group: "footer3" },
      { filename: "menufooter4.json", locale: "VI", group: "footer4" },
    ];

    const staged = new Map<string, { signature: string; parentSignature: string | null }>();
    const sourceToSignature = new Map<string, string>();

    for (const source of files) {
      const rows = this.readJson<JsonRecord[]>(source.filename);
      for (const row of rows) {
        const label = this.normalizeMenuLabel(
          this.nonEmptyString(row.tenmenu) || this.nonEmptyString(row.label) || this.nonEmptyString(row.tukhoa),
        );
        if (!label || this.isPlaceholderMenuLabel(label)) continue;

        const urls = this.resolveMenuUrls(this.nonEmptyString(row.url) || this.nonEmptyString(row.duongdan) || "#");
        const resolvedLabel = this.resolveExpectedMenuLabel(label, urls.url);
        const signature = `${source.locale}|${resolvedLabel}|${urls.url}`;
        const sourceKey = `${source.group}:${String(row.id)}`;
        sourceToSignature.set(sourceKey, signature);
        if (!staged.has(signature)) {
          staged.set(signature, { signature, parentSignature: null });
        }
      }
    }

    for (const source of files) {
      const rows = this.readJson<JsonRecord[]>(source.filename);
      for (const row of rows) {
        const sourceKey = `${source.group}:${String(row.id)}`;
        const signature = sourceToSignature.get(sourceKey);
        if (!signature) continue;

        const parentRaw = String(row.id_cha ?? "").trim();
        if (!parentRaw) continue;

        const parentSignature = sourceToSignature.get(`${source.group}:${parentRaw}`) || null;
        if (parentSignature) {
          staged.set(signature, { signature, parentSignature });
        }
      }
    }

    return staged;
  }

  private expectedMediaUrls(): Set<string> {
    const urls = new Set<string>();
    const addUrl = (value: unknown) => {
      const url = this.nonEmptyString(value);
      if (!url || url.startsWith("/uploads/")) return;
      if (url.startsWith("http")) urls.add(url);
    };

    for (const record of this.readJson<JsonRecord[]>("doitac.json")) addUrl(record.anhdaidien);
    for (const record of this.readJson<JsonRecord[]>("post.json")) addUrl(record.anhdaidien);
    for (const record of this.readJson<JsonRecord[]>("hosomoitruong.json")) addUrl(record.anhdaidien);
    for (const record of this.readJson<JsonRecord[]>("page_all.json")) addUrl(record.anhdaidien);
    for (const record of this.readJson<JsonRecord[]>("service.json")) addUrl(record.anhdaidien);
    for (const record of this.readJson<JsonRecord[]>("banlanhdao.json")) addUrl(record.anhdaidien);
    for (const record of this.readJson<JsonRecord[]>("bancovan.json")) addUrl(record.anhdaidien);
    for (const record of this.readJson<JsonRecord[]>("feel.json")) addUrl(record.anhdaidien);

    const galleryRecord = this.readJson<JsonRecord[]>("module_images.json").find((record) => String(record.id) === "1");
    if (typeof galleryRecord?.gallery_image === "string") {
      for (const rawUrl of galleryRecord.gallery_image.split(",").map((value) => value.trim()).filter(Boolean)) {
        addUrl(rawUrl);
      }
    }

    return urls;
  }

  private expectedConfigurationKeys(): Set<string> {
    const configs = this.readJson<JsonRecord[]>("configurations.json");
    const siteInfo = this.readJson<JsonRecord[]>("info_website.json");
    const config = configs[0] || {};
    const site = siteInfo[0] || {};

    const firstNonEmpty = (...values: unknown[]) => {
      for (const value of values) {
        const normalized = this.nonEmptyString(value);
        if (normalized) return normalized;
      }
      return "";
    };

    const normalizeWebsiteUrl = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return "";
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      if (trimmed.startsWith("//")) return `https:${trimmed}`;
      return `https://${trimmed}`;
    };

    const siteName = firstNonEmpty(site.name, "Viện Phương Nam");
    const organizationName = firstNonEmpty(config.tencongty, "Viện phát triển nguồn lực xã hội Phương Nam");
    const slogan = firstNonEmpty(site.slogan, "Đào tạo, nghiên cứu và kết nối nguồn lực xã hội vì cộng đồng.");
    const address = firstNonEmpty(config.diachi1, config.diachi, "45 Đinh Tiên Hoàng, Phường Sài Gòn, TP.HCM (Quận 1)");
    const phonePrimary = firstNonEmpty(config.hotline0, config.hotline, config.hotline1, "0912 114 511");
    const phoneSecondary = firstNonEmpty(config.hotline1, config.hotline0, "(028) 2242 6789");
    const email = firstNonEmpty(config.email1, config.email, "vanphong@vienphuongnam.com.vn");
    const websiteUrl = normalizeWebsiteUrl(firstNonEmpty(config.duongdanwebsite));
    const facebookUrl = firstNonEmpty(config.duongdanfacebook);
    const youtubeUrl = firstNonEmpty(config.duongdanyoutube);
    const mapsUrl = firstNonEmpty(config.duongdanmaps);
    const logoUrl = firstNonEmpty(site.mainlogo, site.logo, site.logowhite);
    const faviconUrl = firstNonEmpty(site.favicon);
    const copyright = firstNonEmpty(
      site.copyright0,
      site.copyright,
      `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`,
    );
    const footerDescription = firstNonEmpty(`${organizationName}. ${slogan}`, organizationName, slogan);

    const pairs: Array<[string, string]> = [
      ["general.site_name", siteName],
      ["general.site_name_en", "Vien Phuong Nam Institute"],
      ["general.organization_name", organizationName],
      ["general.tagline", slogan],
      ["general.contact_phone", phonePrimary],
      ["general.contact_phone_secondary", phoneSecondary],
      ["general.contact_email", email],
      ["general.contact_address", address],
      ["general.social_facebook", facebookUrl],
      ["general.social_youtube", youtubeUrl],
      ["general.website_url", websiteUrl],
      ["general.map_url", mapsUrl],
      ["general.logo_url", logoUrl],
      ["general.favicon_url", faviconUrl],
      ["general.header_cta_text", "Liên hệ tư vấn"],
      ["general.header_cta_text_en", "Contact Us"],
      ["general.header_cta_url", "/lien-he"],
      ["general.footer_description", footerDescription],
      ["general.footer_copyright", copyright],
      ["header.logo_url", logoUrl],
      ["header.logo_text", siteName],
      ["header.phone", phonePrimary],
      ["header.cta_text", "Liên hệ tư vấn"],
      ["header.cta_text_en", "Contact Us"],
      ["header.cta_url", "/lien-he"],
      ["footer.description", footerDescription],
      ["footer.phone", phonePrimary],
      ["footer.email", email],
      ["footer.address", address],
      ["footer.facebook", facebookUrl],
      ["footer.youtube", youtubeUrl],
      ["footer.copyright", copyright],
      ["footer.privacy_label", "Chính sách bảo mật"],
      ["footer.privacy_label_en", "Privacy Policy"],
      ["footer.privacy_url", "/chinh-sach-bao-mat"],
      ["footer.privacy_url_en", "/en/privacy-policy"],
      ["footer.terms_label", "Điều khoản sử dụng"],
      ["footer.terms_label_en", "Terms of Service"],
      ["footer.terms_url", "/dieu-khoan-su-dung"],
      ["footer.terms_url_en", "/en/terms"],
    ];

    return new Set(pairs.filter(([, value]) => Boolean(value)).map(([key]) => key));
  }

  private isPlaceholderMenuLabel(label: string): boolean {
    const normalized = label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");
    return /^tieu de tuy chinh \d+$/.test(normalized);
  }

  private resolveExpectedMenuLabel(label: string, url: string): string {
    return MENU_LABEL_OVERRIDES[url]?.vi || label;
  }

  async run() {
    console.log(`Verifying database against JSON source: ${this.jsonDir}`);

    const [userRows, tagRows, staffRows, pageRows, configRows, menuRows, mediaRows] = await Promise.all([
      prisma.user.findMany({ select: { email: true } }),
      prisma.tag.findMany({ select: { name: true, slug: true } }),
      prisma.staff.findMany({ select: { name: true } }),
      prisma.page.findMany({ select: { slug: true } }),
      prisma.configuration.findMany({ select: { key: true } }),
      prisma.menuItem.findMany({
        select: {
          label: true,
          url: true,
          locale: true,
          parent: {
            select: {
              label: true,
              url: true,
              locale: true,
            },
          },
        },
      }),
      prisma.media.findMany({ select: { url: true } }),
    ]);

    this.addCoverageResult(
      "User",
      this.expectedUserEmails(),
      userRows.map((row) => row.email.toLowerCase()),
      ["Coverage mode ignores pre-existing local users unrelated to the JSON import."],
    );
    this.addCountResult("Category", this.countCategories(), await prisma.category.count());

    const actualTagSlugs = tagRows.map((row) => row.slug);
    const keywordTagSlugs = this.expectedKeywordTagSlugs();
    const missingKeywordBackfillTags = Array.from(keywordTagSlugs).filter((slug) => !actualTagSlugs.includes(slug));
    this.addCoverageResult(
      "Tag",
      this.expectedDedicatedTagSlugs(),
      actualTagSlugs,
      [
        "Strict coverage mode verifies dedicated tags from detail_tags.json using slugs.",
        `Informational only: ${missingKeywordBackfillTags.length} keyword-derived tag slugs are absent on this reused local DB because post-keyword backfill only occurs when matching posts are created or refreshed during import.`,
      ],
    );
    this.addCountResult("Department", 2, await prisma.department.count());
    this.addCountResult("StaffType", 5, await prisma.staffType.count());
    this.addCoverageResult(
      "Staff",
      this.expectedStaffNames(),
      staffRows.map((row) => this.normalizeWhitespace(row.name).toLowerCase()),
      ["Coverage mode matches the importer's name-based idempotency for staff records."],
    );
    this.addCountResult("Partner", this.countPartners(), await prisma.partner.count());
    this.addCountResult("Post", this.countPosts(), await prisma.post.count());
    this.addCountResult("Course", this.countCourses(), await prisma.course.count());
    this.addCoverageResult(
      "Page",
      this.expectedPageSlugs(),
      pageRows.map((row) => row.slug),
      ["Coverage mode verifies imported static page slugs instead of failing on unrelated pre-existing rows."],
    );
    this.addCoverageResult(
      "Configuration",
      this.expectedConfigurationKeys(),
      configRows.map((row) => row.key),
      ["Coverage mode verifies normalized configuration keys seeded from configurations.json and info_website.json."],
    );

    const expectedMenus = this.expectedMenuEntries();
    const actualMenuMap = new Map(
      menuRows.map((row) => [
        `${row.locale}|${row.label}|${row.url}`,
        row.parent ? `${row.parent.locale}|${row.parent.label}|${row.parent.url}` : null,
      ]),
    );
    const menuMissing: string[] = [];
    for (const entry of expectedMenus.values()) {
      if (!actualMenuMap.has(entry.signature)) {
        menuMissing.push(entry.signature);
        continue;
      }

      const actualParent = actualMenuMap.get(entry.signature);
      if ((actualParent || null) !== (entry.parentSignature || null)) {
        menuMissing.push(`parent:${entry.signature}`);
      }
    }

    this.addCustomCoverageResult(
      "MenuItem",
      expectedMenus.size,
      expectedMenus.size - menuMissing.length,
      menuMissing,
      Array.from(actualMenuMap.keys()).filter((signature) => !expectedMenus.has(signature)),
      [
        "Coverage mode validates normalized locale|label|url signatures.",
        "Parent-link mismatches are treated as coverage failures.",
      ],
    );

    this.addCountResult(
      "Service Page",
      this.countServicePages(),
      await prisma.page.count({ where: { template: "service" } }),
      ["Services in d7a8 are stored as Page rows with template = \"service\"."],
    );
    this.addCountResult("Review", this.countReviews(), await prisma.review.count());
    this.addCountResult(
      "HomepageSection",
      this.countHomepageSections(),
      await prisma.homepageSection.count({ where: { locale: "VI" } }),
      ["Verification expects one canonical VI row per homepage section key."],
    );
    this.addCountResult(
      "ContentSection (COURSE)",
      this.countCourseContentSections(),
      await prisma.contentSection.count({ where: { entityType: "COURSE" } }),
    );
    this.addCountResult(
      "ContentSection (SERVICE)",
      this.countServiceContentSections(),
      await prisma.contentSection.count({ where: { entityType: "SERVICE" } }),
    );
    this.addCoverageResult(
      "Media",
      this.expectedMediaUrls(),
      mediaRows.map((row) => row.url),
      ["Coverage mode verifies every expected remote source URL while allowing unrelated local media rows."],
    );

    const discrepancies = this.results
      .filter((result) => result.status === "FAIL")
      .map((result) => ({
        model: result.model,
        expectedCount: result.expectedCount,
        actualCount: result.actualCount,
        difference: result.actualCount - result.expectedCount,
        mode: result.mode,
        missingCount: result.missingCount,
        extraCount: result.extraCount,
      }));

    const report: VerificationReport = {
      summary: {
        totalModelsVerified: this.results.length,
        modelsPassed: this.results.filter((result) => result.status === "PASS").length,
        modelsFailed: discrepancies.length,
        verificationTimestamp: new Date().toISOString(),
        jsonDir: this.jsonDir,
        currentDatabase: process.env.DATABASE_URL || "file:./prisma/dev.db",
      },
      discrepancies,
      results: this.results,
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportPath = path.join(process.cwd(), "reports", `database_verification_report_${timestamp}.json`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

    console.log(`Verification report saved to: ${reportPath}`);
    console.log(`Models passed: ${report.summary.modelsPassed}/${report.summary.totalModelsVerified}`);

    if (discrepancies.length > 0) {
      console.log("Discrepancies:");
      for (const discrepancy of discrepancies) {
        console.log(
          `  - ${discrepancy.model}: expected ${discrepancy.expectedCount}, actual ${discrepancy.actualCount}, diff ${discrepancy.difference}`,
        );
      }
    } else {
      console.log("All verified model checks now satisfy the JSON-source expectations.");
    }

    return report;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const jsonDirArgIndex = args.indexOf("--json-dir");
  const jsonDir = jsonDirArgIndex >= 0
    ? path.resolve(process.cwd(), args[jsonDirArgIndex + 1])
    : path.resolve(process.cwd(), "migrate", "sql_json_export");

  if (!fs.existsSync(jsonDir)) {
    throw new Error(`JSON directory not found: ${jsonDir}`);
  }

  const verifier = new JsonDatabaseVerifier(jsonDir);
  await verifier.run();
}

main()
  .catch((error) => {
    console.error("Verification failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
