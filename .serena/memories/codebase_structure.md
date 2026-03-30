# Codebase Structure

High-level layout:
- `src/app/`: Next.js App Router entrypoints. Contains public Vietnamese routes, localized routes under `[locale]`, admin pages, API route handlers, `layout.tsx`, `globals.css`, `robots.ts`, and `sitemap.ts`.
- `src/components/`: shared UI and feature components. Main groups include `layout`, `route-shell`, `sections`, `ui`, `news`, `services`, `about`, `contact`, `motion`, `effects`, `providers`, `skeletons`, and `lightswind`.
- `src/lib/`: shared services and utilities, including Prisma access, admin auth helpers, homepage/content services, API helpers, monitoring helpers, email, Cloudinary, locale and route helpers.
- `src/i18n/`: locale config, routing, navigation helpers, and request wiring for `next-intl`.
- `src/hooks/`: small reusable hooks such as mobile detection, debounce, and toast state.
- `src/types/`: shared TypeScript contracts.
- `prisma/`: schema, migrations, and Prisma config inputs.
- `scripts/`: standalone build helpers, migration/import utilities, verification helpers, and Chrome MCP helper.
- `messages/`: locale message files.
- `public/`: static assets and local fonts used by the app layout.
- `docs/` and `reports/`: planning, audit, deployment, and verification artifacts.

Routing split:
- Public pages live in `src/app` and `src/app/[locale]`.
- Admin pages live in `src/app/admin`.
- API handlers live in `src/app/api` and `src/app/api/admin`.

Architecture note:
- The repo mixes public UI, admin UI, and data/API code in one Next.js application rather than separate packages or services.