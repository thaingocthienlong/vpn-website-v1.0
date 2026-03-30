# Navbar & Image Recovery Plan

> Superseded for current public-header/homepage refinement work by `docs/PLAN-HOMEPAGE-UI-REFINEMENT.md`. Keep this file as historical recovery context only.

## Context

The user reported three distinct issues after the recent orchestration:

1. **Missing Images**: AVIF images previously uploaded to Cloudinary are now missing (because the database was wiped and re-imported with local broken paths).
2. **Missing Layouts**: `/gioi-thieu/co-cau-to-chuc` is missing the `<Header />` and `<Footer />`.
3. **404 Error**: `/gioi-thieu/hoi-dong-co-van` returns a 404 because the internal folder was named `hoi-dong-co-van-khoa-hoc`.

## Proposed Solutions

### 1. Recover Cloudinary AVIF Images

Since the previous SQLite database was wiped, the only place where the successfully uploaded AVIF image URLs exist is in the Cloudinary storage itself.
**Action Plan**:

- Create a script `scripts/recover-cloudinary-staff.mjs` to connect to the Cloudinary Admin API.
- Fetch all images under the prefixes `vpn/staff` (and check for any specific prefixes used for advisory board).
- Use the public IDs (which contain a normalized version of the staff's name, e.g., `staff_nguyen_van_a_12345`) to match with the names in the Prisma `Staff` table.
- Create `File` records for these matched URLs (storing the `.avif` `secure_url`) and update the corresponding `avatarId` in the `Staff` table.

### 2. Fix Layout for `co-cau-to-chuc`
The copy from the `[locale]` folder did not carry over the `<Header>` and `<Footer>` layout wrappers, as they relied on a `layout.tsx` that isn't present in the root `gioi-thieu`.
**Action Plan**:

- Edit `src/app/gioi-thieu/co-cau-to-chuc/page.tsx`.
- Import the `Header` and `Footer` layout components.
- Wrap the main content with them.

### 3. Fix 404 and Layout for `hoi-dong-co-van`

The user expects the URL to be exactly `/gioi-thieu/hoi-dong-co-van`, but the current folder is `hoi-dong-co-van-khoa-hoc`.
**Action Plan**:

- Rename the folder `src/app/gioi-thieu/hoi-dong-co-van-khoa-hoc` to `src/app/gioi-thieu/hoi-dong-co-van`.
- Update `src/components/layout/Navbar.tsx` to point to the new, corrected URL.
- Edit `src/app/gioi-thieu/hoi-dong-co-van/page.tsx` to ensure it also includes the `<Header />` and `<Footer />` layout wrappers.

## Verification

- Run the extraction script and assert that Cloudinary connections succeed and avatars reappear on the website.
- Launch the browser subagent to render `/gioi-thieu/co-cau-to-chuc` and `/gioi-thieu/hoi-dong-co-van` to visually confirm headers, footers, and AVIF images.
