# Homepage Caching and Rendering Fix Plan

## Problem 1: Root Page (`/`) Not Updating
**Symptoms**: After updating the homepage via the CMS, navigating to `http://localhost:3000/` shows stale content. However, navigating to `http://localhost:3000/vi` or `/en` shows updated content immediately.

**Root Cause**: 
In Next.js, `src/app/page.tsx` has no dynamic parameters (like `params`), while `src/app/[locale]/page.tsx` has dynamic `params`. Because of this, Next.js treats `app/page.tsx` as totally static and pre-renders it at build time. When the API calls `revalidatePath("/", "layout")`, the static root route caching doesn't easily bust instantly on local routing caches.

**Solution**:
Force `src/app/page.tsx` to be dynamically rendered, so it perfectly matches the behavior of the locale-specific endpoints `/vi` and `/en`. 
- **Action**: Add `export const dynamic = "force-dynamic";` to `src/app/page.tsx`. This tells Next.js to always render this endpoint dynamically, forcing it to fetch fresh queries or read directly from the `unstable_cache` stores (which are correctly invalidated by `revalidateTag('homepage_sections')`).

---

## Problem 2: Hero Section Video Not Changing
**Symptoms**: The `hero` section video remains the same even after putting a different URL in the CMS, even on `/vi` or `/en`.

**Root Cause**:
In `src/components/sections/HeroSection.tsx`, the `videoUrl` is received successfully. However, the video is rendered using a standard HTML5 `<video>` tag:
```tsx
<video autoPlay loop muted playsInline>
    <source src={displayedVideoUrl} type="video/mp4" />
</video>
```
While React updates the `src` attribute of the `<source>` tag when the property changes, the browser's HTML5 `<video>` element **does not automatically load** a new video stream unless forced to remount or explicitly called via JS (`videoRef.current.load()`).

**Solution**:
Add a React `key` prop based on the URL to the `<video>` element. When the URL changes, React will completely destroy the old video DOM element and instantiate a new one, triggering an automatic buffer and playback of the new source.
- **Action**: Update the `<video>` element in `HeroSection.tsx` to include `key={displayedVideoUrl}`.

---

## Implementation Steps
1. Modify `src/app/page.tsx`:
   - Add `export const dynamic = "force-dynamic";` at the top.
2. Modify `src/components/sections/HeroSection.tsx`:
   - Find the `<video>` element in the `auto-rows-[16rem]` `BentoGrid` configuration.
   - Add `key={displayedVideoUrl}`.
