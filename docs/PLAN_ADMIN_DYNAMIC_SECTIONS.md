# PLAN_ADMIN_DYNAMIC_SECTIONS.md

## 1. Problem Statement
The frontend UI has been updated with a new "Glass & Cloud" aesthetic, including a new Bento Grid Hero section. However, the content for this section (e.g., the video URL, text, and selected featured courses) is currently hardcoded in the frontend components (e.g., `HeroSection.tsx`). The user needs a comprehensive administration panel to manage the content of the Hero section, as well as **all other sections** on the homepage dynamically.

## 2. Technical Strategy
We will leverage the existing `HomepageSection` model in `schema.prisma` to power this dynamic behavior.

### 2.1 Database Schema (Already Exists in Prisma)
```prisma
model HomepageSection {
  id          String   @id @default(uuid())
  sectionKey  String   // e.g., 'hero', 'services', 'partners', 'news'
  locale      String   // 'vi' or 'en'
  title       String?
  title_en    String?
  subtitle    String?
  subtitle_en String?
  isEnabled   Boolean  @default(true)
  sortOrder   Int      @default(0)
  config      String?  // JSON string storing section-specific data (e.g., video URLs, specific layout settings)
  // ... timestamps
}
```

### 2.2 Content Structure per Section
To support the different sections, the `config` JSON string will hold specific data structures:
1. **Hero Section (`sectionKey: 'hero'`)**:
   - `videoUrl`: The background video URL for the main video anchor.
   - `ctaPrimaryText`, `ctaPrimaryLink`: Config for the primary call-to-action.
   - `ctaSecondaryText`, `ctaSecondaryLink`: Config for the secondary call-to-action.
   - `featuredCourseIds`: Array of specific Course IDs to highlight in the Bento grid cards.
2. **Other Sections** (e.g., Services, Partners, News, etc.):
   - Structure will follow a similar pattern, using `title`, `subtitle`, and `config` for specific dynamic needs (like background images or specific toggles).

## 3. Implementation Steps

### Phase 1: API & Data Layer (Backend)
- **GET `/api/admin/homepage`**: Fetch all homepage sections across locales, sorted by `sortOrder`.
- **PUT `/api/admin/homepage/[id]`**: Update a specific section's properties, including merging new JSON data into the `config` string.
- **PUT `/api/admin/homepage/reorder`**: Accept an array of IDs and sort orders to support a drag-and-drop reordering interface.

### Phase 2: Admin Panel UI (Frontend - Admin)
- **Homepage Manager (`/admin/homepage/page.tsx`)**:
  - Build a master page listing all sections.
  - Implement a toggle for `isEnabled` and drag-and-drop functionality for `sortOrder` to control the exact layout on the public site.
- **Section Editor Component**:
  - A dynamic form that adapts based on the `sectionKey`.
  - For `hero`: Inputs for the video URL, CTA buttons, and a multi-select dropdown to pick the `featuredCourseIds` from the `Course` database table.

### Phase 3: Public Frontend Integration
- **`src/app/[locale]/(public)/page.tsx`**:
  - Server-side retrieve all enabled `HomepageSection` records for the current locale, ordered by `sortOrder`.
  - Parse the `config` JSON.
  - Feed the specific config data down into `HeroSection`, `ServicesSection`, etc.
  - Dynamically render sections based on the sorted list (this allows the admin to move the 'News' section above the 'Services' section, for instance).

## 4. Verification Plan
- **Backend Tests**: Verify `PUT` endpoints properly sanitize and save the JSON `config` data using valid schema defaults if parts are missing.
- **Admin UI Verification**:
  1. Navigate to `/admin/homepage`.
  2. Toggle a section's visibility and verify it immediately disappears from the frontend.
  3. Edit the Hero section's video URL and confirm the Public Homepage Bento Grid reflects the new video.
- **Security Scans**: Run `security_scan.py` to ensure the API prevents unauthorized modifications to the page layout.

## 5. Orchestration Execution Model
If approved, the orchestration will be split into:
1. `backend-specialist`: Build out the `/api/admin/homepage` endpoints and data validators (Zod schemas).
2. `frontend-specialist`: Build the Admin UI forms to manage these sections and connect the Public Next.js page `/app/[locale]/(public)/page.tsx` to read from the DB.
3. `test-engineer`: Write and execute UI testing steps to verify changes flow from Admin to Public effortlessly.
