# Dark Glassmorphism Design System — Full Consistency Plan

## Goal
Make **every visible component** in the `/new` project consistent with the dark glassmorphism theme already established on the landing page. This covers colors, buttons, text, form inputs, cards, skeletons, badges, modals, sections, and all `[locale]` EN pages.

---

## Audit Summary

| Category | Files Affected | Severity |
|----------|---------------|----------|
| 1. UI Components | 7 files | 🔴 High |
| 2. Skeleton System | 8 files | 🟠 Medium |
| 3. Section Components | 4 files | 🟠 Medium |
| 4. News Components | 3 files | 🟡 Low |
| 5. `[locale]` EN Pages | 12 files | 🔴 High |
| 6. CSS (globals.css) | 1 file | 🟡 Low |
| 7. Layout Components | 2 files | 🟡 Low |

**Total: ~37 files**

---

## Phase 1: Foundation — UI Components (7 files)

> [!IMPORTANT]
> These base components propagate to every page. Fixing them first maximizes impact.

### 1.1 [MODIFY] [Skeleton.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/ui/Skeleton.tsx)
**Current (light):**
```
bg-slate-200
shimmer: via-white/60
```
**Target (dark):**
```
bg-white/10
shimmer: via-white/5
```

### 1.2 [MODIFY] [Button.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/ui/Button.tsx)
**Variants needing update:**
| Variant | Current | Target |
|---------|---------|--------|
| `secondary` | `bg-white text-slate-900 border-slate-200` | `bg-white/10 text-white border-white/10` |
| `outline` | `bg-white text-blue-600 border-blue-200` | `bg-transparent text-blue-400 border-blue-400/30` |
| `ghost` | `text-slate-700 hover:bg-slate-100` | `text-slate-300 hover:bg-white/10` |

### 1.3 [MODIFY] [Input.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/ui/Input.tsx)
| Property | Current | Target |
|----------|---------|--------|
| Normal border | `border-slate-200` | `border-white/10` |
| Background | `bg-white` | `bg-white/5` |
| Label | `text-slate-700` | `text-slate-300` |
| Left/right addon | `text-slate-400` | `text-slate-500` |
| Error text | `text-red-600` | `text-red-400` |
| Helper text | `text-slate-500` | `text-slate-500` (keep) |
| Add | — | `text-white placeholder:text-slate-500` |

### 1.4 [MODIFY] [Select.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/ui/Select.tsx)
Same pattern as Input: `bg-white` → `bg-white/5`, `border-slate-200` → `border-white/10`, label → `text-slate-300`, add option dark bg.

### 1.5 [MODIFY] [Textarea.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/ui/Textarea.tsx)
Same pattern as Input.

### 1.6 [MODIFY] [Badge.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/ui/Badge.tsx)
| Variant | Current | Target |
|---------|---------|--------|
| `default` | `bg-blue-50 text-blue-600` | `bg-blue-500/20 text-blue-300` |
| `secondary` | `bg-slate-100 text-slate-700` | `bg-white/10 text-slate-300` |
| `success` | `bg-green-50 text-green-700` | `bg-emerald-500/20 text-emerald-300` |
| `warning` | `bg-orange-50 text-orange-700` | `bg-orange-500/20 text-orange-300` |
| `error` | `bg-red-50 text-red-700` | `bg-red-500/20 text-red-300` |
| `primary` | gradient (already fine) | Keep |
| `accent` | gradient (already fine) | Keep |
| `hot` | gradient (already fine) | Keep |

### 1.7 [MODIFY] [ClayCard.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/ui/ClayCard.tsx)
- `flat` variant: `bg-white border border-slate-200` → `bg-white/5 border border-white/10`

### 1.8 [MODIFY] [Modal.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/ui/Modal.tsx)
| Element | Current | Target |
|---------|---------|--------|
| Header border | `border-slate-200` | `border-white/10` |
| Title | `text-slate-800` | `text-white` |
| Close hover | `hover:bg-slate-100` | `hover:bg-white/10` |
| Close icon | `text-slate-500` | `text-slate-400` |

### 1.9 [MODIFY] [SearchDialog.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/ui/SearchDialog.tsx)
Audit for `bg-white`, `text-slate-800`, `border-slate-200` patterns and convert.

---

## Phase 2: Skeleton System (8 files)

> After fixing `Skeleton.tsx` base (`bg-slate-200` → `bg-white/10`), update all skeleton files.

### Files:
| File | Key Change |
|------|-----------|
| [CardGridSkeleton.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/skeletons/CardGridSkeleton.tsx) | `bg-white/70` → `glass-card` / `bg-white/5`, box-shadows → remove |
| [NewsCardSkeleton.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/skeletons/NewsCardSkeleton.tsx) | `bg-white/70 backdrop-blur-md` → `glass-card`, `border-slate-100` → `border-white/10` |
| [NewsDetailSkeleton.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/skeletons/NewsDetailSkeleton.tsx) | Same pattern |
| [StaffCardSkeleton.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/skeletons/StaffCardSkeleton.tsx) | Same pattern |
| [FormSkeleton.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/skeletons/FormSkeleton.tsx) | `bg-white` → `glass-card`, `border-slate-200` → `border-white/10` |
| [TableSkeleton.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/skeletons/TableSkeleton.tsx) | Same pattern |
| [DashboardSkeleton.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/skeletons/DashboardSkeleton.tsx) | Same pattern |

---

## Phase 3: Section Components (4 files)

| File | Status | Changes |
|------|--------|---------|
| [CTASection.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/sections/CTASection.tsx) | ✅ Already dark | Button secondary uses `bg-white` via variant (fixed in Phase 1) |
| [ContactSection.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/sections/ContactSection.tsx) | ⚠️ Mixed | `bg-white/50` info cards → `bg-white/5`, `bg-green-100` success → `bg-emerald-500/20` |
| [SectionHeader.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/sections/SectionHeader.tsx) | ⚠️ Light text? | Audit for any `text-slate-800` |
| [GallerySection.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/sections/GallerySection.tsx) | ⚠️ Light | `bg-white` → `glass-card` |
| [VideosSection.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/sections/VideosSection.tsx) | ⚠️ Light | `bg-white` → `glass-card` |

---

## Phase 4: News Components (3 files)

| File | Changes |
|------|---------|
| [NewsSidebar.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/news/NewsSidebar.tsx) | `bg-white` → `glass-card`, text colors |
| [NewsList.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/news/NewsList.tsx) | Residual `bg-white` patterns |
| [NewsPagination.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/news/NewsPagination.tsx) | Residual `bg-white` patterns |

> `NewsDetail.tsx` — ✅ Already fully dark!

---

## Phase 5: `[locale]` EN Pages (12 files)

These are English-language equivalents of the already-converted Vietnamese pages. Apply **identical** dark glassmorphism patterns.

| Page | Vietnamese Counterpart (already done) |
|------|--------------------------------------|
| `[locale]/about/page.tsx` | N/A (EN only) |
| `[locale]/about/partners/page.tsx` | `gioi-thieu/doi-tac` ✅ |
| `[locale]/about/structure/page.tsx` | `gioi-thieu/co-cau-to-chuc` ✅ |
| `[locale]/about/advisory-board/page.tsx` | `gioi-thieu/hoi-dong-co-van` ✅ |
| `[locale]/about/vision-mission/page.tsx` | `gioi-thieu/tam-nhin-su-menh` ✅ |
| `[locale]/contact/page.tsx` | `lien-he` ✅ |
| `[locale]/news/page.tsx` | `tin-tuc` ✅ |
| `[locale]/services/page.tsx` | `dich-vu` ✅ |
| `[locale]/services/[slug]/page.tsx` | `dich-vu/[slug]` ✅ |
| `[locale]/training/page.tsx` | `dao-tao` ✅ |
| `[locale]/training/[slug]/page.tsx` | `dao-tao/[slug]` ✅ |
| `[locale]/training/register/page.tsx` | `dao-tao/dang-ky` ✅ |

---

## Phase 6: CSS & Layout (3 files)

### 6.1 [MODIFY] [globals.css](file:///c:/Users/longt/Desktop/website/new/src/app/globals.css)
- `.content-area` block (lines 247-278): uses `bg-off-white`, `color: var(--text-dark)` — convert to dark variant or remove if unused

### 6.2 [MODIFY] [Header.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/layout/Header.tsx)
- Audit for any remaining `bg-white` in mobile menu, dropdown panels

### 6.3 [MODIFY] [Footer.tsx](file:///c:/Users/longt/Desktop/website/new/src/components/layout/Footer.tsx)
- Already mostly dark, check for `bg-white` residuals

---

## Design Tokens Reference

| Token | CSS Value |
|-------|-----------|
| Card background | `glass-card` or `bg-white/5` |
| Card border | `border border-white/10` |
| Heading text | `text-white` |
| Body text | `text-slate-300` |
| Muted text | `text-slate-400` |
| Label text | `text-slate-300` |
| Input bg | `bg-white/5` |
| Input border | `border-white/10` |
| Input text | `text-white placeholder:text-slate-500` |
| Error text | `text-red-400` |
| Error border | `border-red-400` |
| Active/selected | `bg-blue-500/20 text-blue-300 border-blue-500` |
| Hover overlay | `hover:bg-white/10` |
| Skeleton bg | `bg-white/10` |
| Skeleton shimmer | `via-white/5` |
| Section divider | `border-white/10` |

---

## Verification Plan

### Automated
1. `npm run build` — must pass with exit code 0
2. `grep -r "bg-white[^/]" src/` — should return 0 hits (excluding `bg-white/` opacity variants)
3. `grep -r "bg-slate-50\|bg-slate-100\|bg-slate-200" src/components/` — should return 0 hits
4. `grep -r "text-slate-[78]00" src/components/` — should return 0 (except admin)

### Visual
- Visit each page in browser and verify no white backgrounds, no light cards, no light inputs
- Confirm skeleton shimmer is subtle on dark background (not white flash)

---

## Execution Order

```
Phase 1 (Foundation)  →  Phase 2 (Skeletons)  →  Phase 3 (Sections)
         ↓                                               ↓
Phase 4 (News)        →  Phase 5 ([locale])   →  Phase 6 (CSS/Layout)
         ↓
     Verification
```

> [!TIP]
> Phase 1 should be done first because Button, Input, Select, Textarea, Badge, and Skeleton are imported across the entire project. Fixing them at the source cascades dark theme everywhere they're used.

---

## Excluded from Scope

- **`/admin` pages** — Admin dashboard has its own light theme (intentional)
- **`/api` routes** — No UI
- **CKEditorWrapper.tsx** — Rich text editor internals
- **ImageUpload.tsx** — Admin-only component
- **RichTextEditor.tsx** — Admin-only component
