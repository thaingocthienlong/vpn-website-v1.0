import { revalidatePath, revalidateTag } from "next/cache";

function safeRevalidatePath(path: string, type?: "page" | "layout") {
    if (!path) return;
    revalidatePath(path, type);
}

function expireTag(tag: string) {
    if (!tag) return;
    revalidateTag(tag, { expire: 0 });
}

export function revalidateSiteConfig() {
    expireTag("site-config");
    expireTag("menu-items");
    safeRevalidatePath("/", "layout");
    safeRevalidatePath("/en", "layout");
}

export function revalidateAppearanceConfig() {
    expireTag("appearance-config");
    safeRevalidatePath("/", "layout");
    safeRevalidatePath("/en", "layout");
}

export function revalidateHomepage() {
    expireTag("homepage_sections");
    safeRevalidatePath("/", "layout");
    safeRevalidatePath("/en", "layout");
}

export function revalidateServicePaths(slug?: string | null) {
    safeRevalidatePath("/dich-vu", "page");
    safeRevalidatePath("/en/services", "page");

    if (slug) {
        safeRevalidatePath(`/dich-vu/${slug}`, "page");
        safeRevalidatePath(`/en/services/${slug}`, "page");
    }
}

export function revalidatePostPaths(slug?: string | null, categorySlug?: string | null) {
    safeRevalidatePath("/tin-tuc", "page");
    safeRevalidatePath("/en/news", "page");

    if (slug && categorySlug) {
        safeRevalidatePath(`/tin-tuc/${categorySlug}/${slug}`, "page");
        safeRevalidatePath(`/en/news/${categorySlug}/${slug}`, "page");
    }
}
