# Goal Description
Fix the "wiring" between the Admin Homepage Sections panel (`/admin/homepage`) and the Public Homepage (`/` and `/en`). The user reported that changes made in the admin panel are not correctly mirrored on the front end.

## Analysis and Findings

After analyzing the codebase (`AdminHomepageClient.tsx`, `api-services.ts`, `page.tsx`, and the API routes), two root causes were identified for the disconnect:

### 1. Missing Cache Invalidation
The frontend Next.js app uses `unstable_cache` with a long cache expiry limit (3600 seconds) to fetch homepage layout sections (`getHomepageSections`). When an admin saves changes, toggles section visibility, or reorders them, the backend API (`/api/admin/homepage` and `/api/admin/homepage/reorder`) updates the database but **fails to invalidate the Next.js cache**. This means the frontend still renders stale data until the cache expires naturally.

### 2. Disjointed Locale Data Logic
The `HomepageSection` schema and seeder script create TWO rows per section (one for `vi`, one for `en`). 
However, the the admin panel ONLY loads and updates the `vi` row. It incorporates fields for `title_en` and `subtitle_en` within the `vi` row's update logic, effectively ignoring the `en` row. 
Simultaneously, the frontend's `getHomepageSections(locale)` service fetches the row matching the exact user locale. Since the `en` row is never updated by the admin panel, English visitors always see the default, inactive, or un-customized sections.

## Proposed Changes

We will fix this by making the `vi` row the single source of truth for all homepage layout configuration, leveraging its `title_en` and `subtitle_en` fields for translations, and ensuring the cache is instantly refreshed upon update.

### src/app/api/admin/homepage/route.ts
**Summary:** Add cache invalidation to instantly refresh the front-end when a section detail is updated.
- Modify `PUT /api/admin/homepage` to call `revalidateTag("homepage_sections")` after successfully updating a section in Prisma.

### src/app/api/admin/homepage/reorder/route.ts
**Summary:** Add cache invalidation to instantly refresh the front-end when sections are dragged and dropped.
- Modify `PUT /api/admin/homepage/reorder` to call `revalidateTag("homepage_sections")` after successfully updating the sort order.

### src/lib/services/api-services.ts
**Summary:** Modify `getHomepageSections` to solely retrieve the `vi` rows as the source of truth, thus aligning with what the admin UI modifies.
- Change the `prisma.homepageSection.findMany` query to `where: { locale: 'vi', isEnabled: true }` regardless of the request locale.
- Upon mapping the returned `sections`, dynamically evaluate the `locale` parameter. If `locale === 'en'`, map `title` to `sec.title_en` and `subtitle` to `sec.subtitle_en` instead of using the base values.

## Verification Plan

### Manual Verification
1. Open the Admin Homepage UI (`/admin/homepage`).
2. Hide a section (e.g., "News").
3. Immediately navigate to the frontend Homepage (`/`) and verify the "News" section is hidden.
4. Go back to the Admin UI, update the "Hero" section's video link and English title/subtitle.
5. In the frontend, navigate to `/en` and verify the background video is updated, and the English title/subtitle appear correctly.
6. Reorder two sections in the Admin UI and verify the frontend reflects this reorder instantly without a hard refresh.
