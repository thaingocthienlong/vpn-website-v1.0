# UI/UX Redesign Plan (Project, Sections, Components, Header, Footer)

## Task Description
Orchestrate a comprehensive redesign of the website's background system and overarching layout features (header, footer, sections, components) based on the latest `ui-ux-pro-max` analysis. The goal is to align with the "Enterprise Gateway / Micro-interactions" system using a vibrant, trust-building light palette (`sky-50` base).

## Proposed Changes

### 1. Global Project Background (`app/layout.tsx` & `ModernBackground.tsx`)
- Modify `ModernBackground.tsx` to use the official style palette: change the base from `bg-slate-50` to `#F0F9FF` (`bg-sky-50`).
- Adjust the glowing pseudo-gradients to use `bg-sky-300/20` and `bg-orange-300/10` to bridge the Primary (Sky) and CTA (Orange) color tokens. 

### 2. Header Redesign
- Ensure the header uses a glassmorphic `bg-white/80` with a subtle `border-b border-gray-200` to separate it clearly from the `sky-50` background.
- Adjust logo or nav links to use `#0C4A6E` (`sky-900`) text for maximum contrast on light backgrounds.
- Remove any dark mode specific overrides (`dark:bg-slate-900`) since the strategy explicitly marks dark mode as an anti-pattern.

### 3. Footer Redesign
- Change the footer background to `bg-sky-100` or a very light `bg-slate-50` with `border-t border-sky-200`.
- Update text colors to `sky-900` for headings and `slate-500` for muted generic text links.
- Add `hover:text-sky-500` micro-interactions (`transition-colors duration-200`) on footer links.

### 4. Component Redesign (Cards & Containers)
- Target component files (e.g., Course content cards, CTAs, Modals).
- Ensure all interactive cards have `bg-white`, a `border-gray-200` (or `border-sky-100`), `shadow-sm`, and `md` (12px) border radius.
- Implement `cursor-pointer` and `hover:shadow-md` or `hover:border-sky-300` providing tactile feedback without heavy scale animations.
- Ensure CTA buttons use the designated `#F97316` (`bg-orange-500`) with white text, and secondary buttons use `#0EA5E9` (`bg-sky-500`).

### 5. Section Backgrounds (Alternating Pattern)
- Adjust the `<section>` wrappers in Homepage / Pages.
- Strategy: Alternate between `bg-transparent` (letting the ModernBackground show through) and solid `bg-white` (for reading-heavy data) to create visual rhythm.

## Verification Plan

### Automated Tests
- Run `npm run lint` to catch React hook/syntax errors.
- Run typechecks via `npx tsc --noEmit` if necessary.

### Manual Verification
- Render the site in `npm run dev`.
- Verify the header and footer correctly sit against the new background.
- Verify that card borders (gray-200) are fully visible in light mode.
- Verify that `prefers-reduced-motion` and contrast accessibility requirements (Sky-900 on Sky-50) meet the 4.5:1 ratio constraint.

## Orchestration Phase 2 Mapping
- **`frontend-specialist`**: Handles the UI layout, Tailwind CSS sweeping changes across sections/components, and implements the `MASTER.md` styles.
- **`seo-specialist`** (or SEO review): Verifies that background/contrast changes do not harm lighthouse accessibility metrics or disrupt `<main>` tags.
- **`test-engineer`**: Runs compilation, linting, and visual spot checks across responsive widths (375px, 768px, 1024px).
