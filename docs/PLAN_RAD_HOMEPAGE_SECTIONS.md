# Plan: Dedicated RAD Documents for Homepage Components

## Objective
The initial Architecture Plan (`PLAN_REPAIR_ADMIN_HOMEPAGE.md`) defines the broad orchestration for the dynamic homepage. However, to guarantee parallel execution safety, we must rigorously analyze, research, and create dedicated Rapid Application Development (RAD) specifications for **each** of the 12 specific components on the Homepage. This process prevents data schema collisions and enforces the UI components to correctly render the JSON data.

## Components to Analyze & Specify
1. **Hero Section**
2. **Services Section**
3. **Training (Courses) Section**
4. **Videos Section**
5. **Partners Section**
6. **Reviews (Testimonials) Section**
7. **News (Blog Posts) Section**
8. **Gallery Section**
9. **CTA Section**
10. **Contact Section**
11. **Header (Navbar)**
12. **Footer**

## Orchestration Strategy: The Component Specifications

### 🔴 Phase 1: Research & UI/UX Deconstruction
**Agent:** `explorer-agent`, `frontend-specialist`
**Action:**
1. Deep-dive into each `.tsx` component file in `src/components/sections/` and `src/components/layout/`.
2. Map the exact DOM structure, CSS (Tailwind) rules, interactive triggers, text placeholders, and image sources.
3. Identify dynamic arrays and database relations (e.g., `featuredCourseIds`, `partnerIds`).

### 🔴 Phase 2: RAD Document Generation (The Specification)
**Agent:** `project-planner`, `backend-specialist`
**Action:**
Produce individual markdown specifications inside the `docs/rad/` directory (e.g., `docs/rad/HERO_SECTION.md`, `docs/rad/SERVICES_SECTION.md`). 

Each detailed RAD document **MUST** outline:
- **Visual Spec:** General layout behaviour (Responsive behaviour).
- **TypeScript Schema (`interface`)**: Exact structure of the JSON blob the component requires.
- **Frontend Fallbacks**: The default `DEFAULT_[NAME]_CONFIG` constant to prevent null crashes before database seeding.
- **Admin Dashboard UI Mapping**: Specifies the form inputs required for the admin to configure the component (e.g., File Upload for Video URL, Multi-Select for Courses, Rich Text for subtitles).

### 🔴 Phase 3: Global Config Consolidation
**Agent:** `database-architect`
**Action:**
Merge the 12 RAD Schemas into a definitive `src/types/site-config.ts` type-definition file, locking down the `SiteConfiguration` allowed JSON shapes via Zod validation schemas.

---

> [!IMPORTANT]
> **User Review Required**  
> Approving this plan will trigger an orchestration sequence where agents will systematically review each UI component, and build out its rigorous RAD document. 
