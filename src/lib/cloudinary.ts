/**
 * Cloudinary image optimization utilities
 * Transforms Cloudinary URLs to serve appropriately sized images
 */

const CLOUDINARY_REGEX = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/.+)$/;

/**
 * Transform a Cloudinary URL to serve an optimized image
 * Adds width, quality, and format auto-detection transforms
 *
 * @param url - Original Cloudinary URL
 * @param width - Desired width in pixels
 * @param quality - Image quality (1-100), default 'auto'
 * @returns Transformed Cloudinary URL
 */
export function optimizeCloudinaryUrl(
    url: string | null,
    width: number = 400,
    quality: string | number = 'auto'
): string | null {
    if (!url) return null;

    const match = url.match(CLOUDINARY_REGEX);
    if (!match) return url; // Not a Cloudinary URL, return as-is

    const [, base, path] = match;
    // Insert transformation parameters before the version/path
    return `${base}c_fill,w_${width},q_${quality},f_auto/${path}`;
}

/**
 * Predefined sizes for common use cases
 */
export const ImageSizes = {
    /** Course card thumbnail (card grid) */
    CARD_THUMBNAIL: 400,
    /** Course card thumbnail on mobile */
    CARD_THUMBNAIL_MOBILE: 640,
    /** Hero/banner image */
    HERO: 1200,
    /** Related course small thumbnail */
    RELATED_THUMBNAIL: 300,
    /** Partner logo */
    PARTNER_LOGO: 200,
    /** Post featured image in list */
    POST_THUMBNAIL: 400,
} as const;
