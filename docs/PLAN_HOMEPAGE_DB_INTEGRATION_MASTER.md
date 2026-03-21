# Implementation Master Plan: Homepage Configuration Database Integration

## General Architecture & Context
The website currently features a hardcoded component-based homepage (`src/app/[locale]/page.tsx`) mapping to components in `src/components/sections`. 
The `HomepageSection` schema and `site-config.ts` exist. The goal is to fully integrate the `HomepageSection` database table with the frontend React components and the backend Admin panel, allowing zero-code content management for the homepage. 

This master plan covers **Phase 2 (Implementation)** and **Phase 3 (Verification)** in fine detail. 

---

## Phase 2: Implementation (Sequential and Parallel)

### Task 1: Comprehensive Backend Data Layer (`backend-specialist`)
**Target:** `src/lib/services/api-services.ts`
1. **Typing & Deep Merge Serialization:**
   - Define a strong internal type `ParsedHomepageSection` mapped to `SiteConfigurationData`.
   - Update `getHomepageSections` to safely parse `config` strings into typed JSON. 
   - **Crucial:** Implement a utility `utils/deepMerge.ts`. When returning data, the server must `deepMerge(DEFAULT_CONFIG, parsedDbConfig)` so partial NoSQL object payloads do not overwrite nested arrays/objects (preventing data loss of original `site-config` defaults).
2. **Performance Optimization:**
   - Implement `unstable_cache` from `next/cache` for `getHomepageSections`.
   - Define cache tags: `["homepage_sections", locale]`
   - Apply identical caching mechanisms for `getFeaturedPosts`, `getFeaturedCourses`, and `getActivePartners`.
   - Result: Sub-millisecond read times for the homepage after the first cache hit.

### Task 2: Layout & Global Setup (`backend-specialist` + `frontend-specialist`)
**Target:** `src/app/[locale]/layout.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`
1. **Dynamic Navigation & Footer (Optional/Extended):**
   - Read `NavbarConfig` and `FooterConfig` from `site-config` table/structure if implemented.
   - If `HomepageSection` solely targets body sections, clearly decouple `Header` and `Footer` fetching logic or incorporate them as dedicated keys (e.g., `sectionKey: "navbar"`).
2. **Global Fallbacks:**
   - Provide fallback defaults for SEO Metadata (`title`, `description`) directly fetched from DB.

### Task 3: Props Refactoring & Component Upgrades (`frontend-specialist`)
**Target:** `src/components/sections/*.tsx` (HeroSection, ServicesSection, etc.)
1. **Schema Hydration & Binding:**
   - Map props inside `HeroSection.tsx` to accept the full `HeroConfig` structure. 
   - Parse and apply extended fields like `ctaPrimary.href`, `ctaPrimary.text`.
2. **Dynamic Overrides:**
   - Replace any hardcoded locale-based tertiary checks (e.g., `isEn ? "Watch Demo" : "Xem"`) with the injected data from the dynamic DB props `title` and `subtitle`.
   - Do the same for every other section: `ServicesSection`, `PartnersSection`, `TrainingSection`, `NewsSection`, `ReviewsSection`, `GallerySection`, `ContactSection`, `VideosSection`.
3. **Null Object Pattern / Graceful Degradation:**
   - If the DB row yields `config: null`, the component must fall back to the `DEFAULT_X_CONFIG` specified in the RAD interfaces.

### Task 4: Dynamic Page Rendering (`frontend-specialist`)
**Target:** `src/app/[locale]/page.tsx`
1. **Server Component Data Hydration:**
   - The Root page component (`app/[locale]/(public)/page.tsx`) acts strictly as a Hydration Controller.
   - Wait for `config = await getHomepageSections()`.
   - Perform a `Promise.all` fetch querying Prisma `findMany` using the string arrays (`featuredCourseIds`, `featuredPartnerIds`, etc.) to hydrate fully typed Objects (`Course[]`, `Partner[]`).
2. **Renderer Engine:**
   - Refactor `renderSection` to loop over the sorted `sections`.
   - Client Components must **never** do their own data fetching for these core entities. Pass the populated arrays (`featuredPrograms={courses}`) securely to pure Client UI Components.
   
### Task 5: Admin Panel API & UI (`backend-specialist` & `frontend-specialist`)
**Target:** `src/app/api/admin/homepage/route.ts` & `src/app/[locale]/(admin)/admin/homepage/page.tsx`
1. **Security & Validation (API):**
   - Create generic Zod schemas mirroring `[Section]Config` structs.
   - Verify active session (`getSession()`) and Admin roles before allowing PATCH/PUT operations to the `HomepageSection` table.
   - Revalidate tags: Call `revalidateTag('homepage_sections')` on a successful mutation.
2. **Visual Editor (UI):**
   - Create a JSON Editor or Form GUI for each section configuration based on the `sectionKey`.
   - Enable toggling visibility (`isEnabled`), ordering (`sortOrder`), and raw config JSON manipulation.

### Task 6: Initial Database Seed Operations (`database-architect`)
**Target:** `prisma/seed.js` OR a `scripts/seed-homepage.ts` file
1. **Base Seeding:**
   - Insert default rows for `hero`, `partners`, `services`, `training`, `news`, `videos`, `gallery`, `contact` for both `vi` and `en` locales if they do not exist.
   - Set accurate stringified JSON formats aligned with the schema defaults (e.g. `{"videoUrl": "..."}`).

---

## Phase 3: Verification, Profiling & Security (QA & SecOps)

### 1. Functional Testing & Type Safety
- **Type Checking:** Run `tsc --noEmit` and build logs. Ensure `parsed.config` maps safely across TypeScript bounds.
- **Rendering:** Verify server logs print cache hits dynamically.

### 2. Performance Verification (`performance-engineer`)
- **Metric Check:** Check total time rendered for `/`. Without cache vs With cache. Ensure `unstable_cache` properly tags and hits KV/Memory store.
- **Payload Size:** Ensure no massive serialized JSON blobs are embedded into the client. React Server Components should send only exact required DOM.

### 3. Security Check (`security-engineer`)
- **API Boundary:** Ensure `GET` / `PATCH` strictly requires `x-admin-role` or `next-auth` valid session.
- **JSON Injection Risk Check:** Ensure React safely bounds and escapes `sec.config` outputs (NextJS naturally escapes string properties unless explicitly forced via `dangerouslySetInnerHTML`).

---
## Rollout Commands Sequence:
1. Seed Database: `npx prisma db seed` or custom script.
2. Build Validation: `npm run build`
3. NextJS Restart: `npm run dev` or `npm start`
