# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [2026-02-18]
### Added
- **Organizational Structure**: Implemented "Cơ cấu tổ chức" page (`/gioi-thieu/co-cau-to-chuc`).
  - Automated migration script `scripts/migrate-staff.mjs` for data & images.
  - New `StaffCard` component with visual hierarchy (Directors vs Staff).
  - Dynamic grouping by Department.

### Fixed
- **UI/UX**: Removed grayscale filter from Partner logos (now full color by default).

### Added
- **Admin Panel**: Integrated CKEditor 5 with custom build.
  - Implemented `CKEditorWrapper` with dynamic imports for performance.
  - Added 40+ plugins including Image Upload, Media Embed, Tables, and Code Blocks.
  - Created `RichTextEditor` component with `variant` support ("full" vs "mini").
  - Replaced native `Textarea` with CKEditor in Posts and Courses create/edit pages.
  - Configured global styles for CKEditor content height (`--editor-min-height`).

### QA & Maintenance
- **Orchestration**: Performed comprehensive QA Sweep (Frontend Build, Backend API, UI Verification).
- **Scripts**: Rewrote `scripts/qa-public-api.js` to use native `http` module, removing dependency on `node-fetch`.


### Changed
- **UI/UX**: Improved contrast for text on dark backgrounds (Videos, Footer, CTAs).
- **UI/UX**: Polished News and Course pages with "Claymorphism" design, cursor pointers, and better spacing.
- **Refactor**: Moved base styles to `@layer base` in `globals.css` to fix specificity issues with Tailwind v4.

### Fixed
- Fixed ghost button text visibility on blue gradient backgrounds.
- Fixed `license-key-missing` warning for CKEditor 5.
- Fixed Homepage UI Gap (**Hotfix**): Removed `pt-24` from `src/app/page.tsx` which caused a large white gap between the Sticky Header and Hero Section.

