# Implementation Plan: Homepage DB to Frontend Integration

## Objective
The orchestration phase defined 12 distinct RAD schemas for the Homepage components (`src/types/site-config.ts`). Now we need to implement the backend parsing logic and update the frontend components to consume this data, rendering a dynamically configurable homepage. We must also provide an Admin interface to edit this data.

## Phase 2: Implementation (Parallel Execution)

### Task 1: Backend Layer Update (`backend-specialist`)
- **Target File:** `src/lib/services/api-services.ts`
- **Action:**
  - Create a mapped type or interface `ParsedHomepageSection` that represents the merged output of `HomepageSection` with `site-config.ts` generics.
  - Implement caching via `unstable_cache` with a cache tag (e.g. `homepage_sections`) to avoid querying SQLite on every page load.
  - Check `getHomepageSections` logic to ensure fallbacks are handled gracefully and `title`/`subtitle` from DB row takes precedence or is merged properly.

### Task 2: Layout Components Data Fetching (`backend-specialist` + `frontend-specialist`)
- **Target Files:** `src/app/[locale]/layout.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`
- **Action:**
  - `Header` and `Footer` configs will be mapped from the `Configuration` table or their own specific section config.
  - We need to fetch the `navbar` and `footer` configuration from the DB and pass them to the layout components.

### Task 3: Section Components Props & Fallbacks (`frontend-specialist`)
- **Target Files:** `src/components/sections/*.tsx`
- **Action:**
  - Update each component's interface to extend or consume their respective `SiteConfigurationData` type (e.g., `HeroConfig`, `ServicesConfig`).
  - Implement the **Null Object Pattern** (Fallbacks) in each component using the `DEFAULT_*_CONFIG` values defined in the RAD specs.
  - Ensure any static internal hardcoded text is replaced by the dynamically passed props.

### Task 4: Page Mapping & Integration (`frontend-specialist`)
- **Target File:** `src/app/[locale]/page.tsx`
- **Action:**
  - Update the `SectionData` type to union or intersect with `SiteConfigurationData`.
  - In `renderSection(sec: SectionData)`, securely cast `sec` to the correct configuration type before passing to the respective section component.
  - Ensure the fallback (empty DB state) still renders components with their default configs correctly.

### Task 5: Admin Panel UI (`frontend-specialist` + `backend-specialist`)
- **Target Files:** `src/app/[locale]/(admin)/admin/homepage/*`, `src/app/api/admin/homepage/route.ts`
- **Action:**
  - Create Admin routes and forms to visually edit the JSON configuration for each section.
  - Support locale switching (Editing VI vs EN strings).
  - API endpoint must save valid JSON schema to `HomepageSection.config`.
  - API endpoint must call `revalidateTag("homepage_sections")` on save.

### Task 6: Initial Database Seeding/Migration (`database-architect`)
- **Target Files:** `prisma/seed.js` or a new setup script/migration.
- **Action:**
  - Inject the 12 base sections with their schema defaults so the Admin UI has rows to query and edit out-of-the-box.

## Phase 3: Verification (`test-engineer`)
- **Target Action:** 
  - Run `npm run lint` and `npm run build` to verify TypeScript typings are strictly enforced.
  - Generate an Orchestration Report summarizing the integration results.
