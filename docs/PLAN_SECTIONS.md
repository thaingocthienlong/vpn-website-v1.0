# Redesign Plan: Sections, Components, and Elements Backgrounds

## Goal Description
Following the removal of the old grid background and the introduction of the new abstract fluid mesh global background, the individual sections and components across the site need their background colors redesigned to achieve perfect harmony, contrast, and depth. This design will emulate modern, high-end SaaS applications, adopting a "Glass & Cloud" layering approach.

## Proposed Strategy: "Glass & Cloud" UI Layering
1. **Layer 0 (Global Background)**: The fluid, elegant `slate-50` with `sky/indigo` blurs.
2. **Layer 1 (Major Sections)**: Alternate between `bg-transparent` (letting the glowing background show through) and soft frosty containers (`bg-white/60 backdrop-blur-md` or `bg-slate-50/50`) to create gentle rhythm without harsh color blocking.
3. **Layer 2 (Component Cards/Widgets)**: Elevated clean white cards (`bg-white` with `shadow-sm` and subtle `border-slate-100`) to create a floating sensation separated from the background layers.
4. **Interactive Elements (Buttons, Inputs)**: Clean solid backgrounds matching the primary brand color (`bg-sky-500` for primary CTA, `bg-white` for secondary with standard borders).

## Detailed Component Changes

### Major Layout Sections
- **HeroSection**: `bg-transparent` to fully reveal the abstract global background as the first impression.
- **ServicesSection**: Change to `bg-white/60 backdrop-blur-md` to subtly frost over the background and separate content.
- **ReviewsSection**: `bg-transparent`.
- **TrainingSection**: `bg-slate-50/60 backdrop-blur-md`.
- **Features/NewsSection**: `bg-transparent`.
- **CTA/ContactSection**: A deep contrast block, e.g., `bg-sky-950` with inverted white text for a strong bottom-of-funnel anchor.

### Components & Elements
- **Data/Feature Cards** (`ServiceCard`, `NewsCard`, `CourseCard`, `TrainingCard`):
  - Ensure uniform `bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300`.
- **Header Navigation**: Retain true glassmorphic header `bg-white/80 backdrop-blur-md border-b border-slate-200/50`.
- **Footer**: Restful solid block `bg-slate-50 border-t border-slate-200`.
- **Buttons**: Enhance with `shadow-sm` and active press states `active:scale-95 transition-transform`.

## Orchestration Details
1. **Agent `project-planner`**: Drafts this plan and awaits user approval. *(Current Phase)*
2. **Agent `frontend-specialist`**: Applies and refactors the Tailwind classes sequentially across all mentioned section and component files.
3. **Agent `test-engineer`**: Runs responsive testing, A11y contrast checks on the new `bg-sky-950` block, and validates all code with `lint_runner.py`.

## User Review Required
> [!IMPORTANT]
> Please review this new layering strategy for the sections and components, adjusting opacity and card borders. Will this transparent/frosted "Glass & Cloud" hierarchy meet your expectations for a modern, pro-max UI? If approved, I will implement both this and the previous background task. 
