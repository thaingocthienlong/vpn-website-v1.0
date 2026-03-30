# Public Routing And i18n

Current model:
- Vietnamese public routes live directly under `src/app`.
- Localized routes live under `src/app/[locale]`.
- `next-intl` is only part of the routing story; the repo also uses custom route mapping helpers.

Observed structure:
- Unprefixed Vietnamese pages include `/`, `/gioi-thieu/*`, `/dao-tao/*`, `/dich-vu/*`, `/tin-tuc/*`, and `/lien-he`.
- English mainly lives under `/en/*` via `[locale]` plus `next-intl` routing.
- Home is the most centralized public flow; many other public areas have separate VI and EN implementations.

Source-of-truth files to re-open when working on routing:
- `src/app/page.tsx`
- `src/app/[locale]/page.tsx`
- `src/app/[locale]/layout.tsx`
- `src/i18n/config.ts`
- `src/i18n/routing.ts`
- `src/i18n/navigation.ts`
- `src/lib/routes.ts`
- `src/proxy.ts`

Key risks:
- Duplicate route-mapping sources across `src/i18n/config.ts`, `src/i18n/routing.ts`, and `src/lib/routes.ts`.
- Locale behavior drift because VI and EN pages often do not share a single implementation path.
- Possible duplicate crawlable Vietnamese content, especially where `[locale]` and direct VI routes can overlap.
- `src/app/layout.tsx` hardcodes `lang="vi"`, which is a risk for English pages unless explicitly overridden.
- The `[locale]` tree contains some Vietnamese-slug routes, which suggests partial migration rather than one normalized i18n system.