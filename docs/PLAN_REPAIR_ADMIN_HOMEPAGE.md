# Implementation Plan: Dedicated Homepage Section Management

## Objective
Implement a "Fixed-Schema Singleton" pattern to manage the 12 distinct homepage components (Hero, Services, Contact, etc.) plus Header/Footer.
Replace the generic page builder approach with dedicated, strongly-typed configuration forms, ensuring zero collisions between parallel agents by strictly defining the APIs and Fallbacks.

## User Review Required
> [!IMPORTANT]
> This plan guarantees parallel agent execution safety by hard-coding fallbacks and strict TS schemas. Please review the updated Schema and Orchestration boundaries before approving execution.

## 1. Database Schema (`prisma/schema.prisma`)
We will create a new generic key-value store optimized for JSON config.

#### [NEW] `SiteConfiguration` Model
```prisma
model SiteConfiguration {
  id        String   @id @default(cuid())
  key       String   // Must map exactly to SectionKey
  locale    String   // 'vi' or 'en'
  data      Json     // Strongly typed JSON config
  updatedAt DateTime @updatedAt

  @@unique([key, locale])
}

// Ensure the exact allowed keys are enforced
enum SectionKey {
  navbar
  hero
  services
  training
  videos
  partners
  reviews
  news
  gallery
  cta
  contact
  footer
}
```

## 2. Shared Types & Fallbacks (`src/types/site-config.ts`)
Create a shared file defining the exact JSON schemas and fallback constants for each key. This is critical to prevent Null Reference Errors on the Frontend if the DB is un-seeded.

```typescript
import { SectionKey } from '@prisma/client';

export interface CTAConfig {
  text: string;
  href: string;
}

export interface HeroConfig {
  title: string;
  subtitle: string;
  videoUrl: string;
  ctaPrimary?: CTAConfig;
  ctaSecondary?: CTAConfig;
  featuredCourseIds: string[]; 
}

export interface GenericSectionConfig {
  title: string;
  subtitle: string;
  displayCount?: number;
}

export interface ContactConfig {
  title: string;
  subtitle: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
}

// Required Frontend Fallbacks (Null Object Pattern)
export const DEFAULT_HERO_CONFIG: HeroConfig = {
    title: "VẬN HÀNH BỀN VỮNG - KIẾN TẠO TƯƠNG LAI",
    subtitle: "Viện Sinh thái Nghề nghiệp (SISRD)...",
    videoUrl: "https://videos.pexels.com/...",
    featuredCourseIds: []
};

// ... Similar constants for DEFAULT_CONTACT_CONFIG, etc.
```

---

## ORCHESTRATION PHASE 2: IMPLEMENTATION DIRECTIVES

This task requires STRICT boundaries between agents to avoid parallel collision. 

### Agent 1: `database-architect` (Foundation)
**Task**: Schema, Migration, and Service Layer
1.  **Update `prisma/schema.prisma`** with `SiteConfiguration` and `SectionKey` enum.
2.  **Run Migration**: `npx prisma db push`.
3.  **Create Service**: `src/lib/services/config-service.ts`
    *   `getSiteConfig(key: SectionKey, locale: string)`
    *   `updateSiteConfig(key: SectionKey, locale: string, data: any)`
4.  **Create API Routes**:
    *   `GET /api/admin/config/[key]?locale=xx`
    *   `PUT /api/admin/config/[key]?locale=xx`
    *(Ensure strict Zod validation against the `src/types/site-config.ts` schemas)*

### Agent 2: `frontend-specialist` (Core UI - Parallel)
**Task**: Admin Dashboard and Forms
*Wait for Agent 1 to declare the API routes complete before proceeding.*
1.  **Dashboard**: Create `src/app/admin/sections/page.tsx` displaying a grid of the 12 `SectionKey` items.
2.  **Dedicated Form Component**: Create dynamic editors in `src/app/admin/sections/[key]/page.tsx`.
    *   Detect the `key` from the URL, render specific inputs matching the strict TS Types.
    *   Connect to `/api/admin/config/[key]`.

### Agent 3: `frontend-specialist` or `backend-specialist` (Integration)
**Task**: Connect Public Public Homepage
1.  **Update `src/app/[locale]/page.tsx`**.
2.  Fetch configurations via `getSiteConfig`.
3.  **Crucial Step**: Merge fetched JSON with the `DEFAULT_*_CONFIG` fallbacks before passing to the UI components to guarantee the page never crashes on null.

### Agent 4: `test-engineer` (Verification)
1.  **Verify UI**: Confirm the Admin UI operating without React errors.
2.  **Verify Public Route**: Test the Public Homepage renders gracefully with empty or seeded configurations.
3.  **Security and Code Standard Audit**: Execute the required AWF verification scripts:
    *   `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .`
    *   `python .agent/skills/lint-and-validate/scripts/lint_runner.py .`
    *(Mandatory pass before closing the task)*
