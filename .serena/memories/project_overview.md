# Project Overview

Purpose: bilingual Next.js website and CMS for SISRD-style public content, training/services/news pages, admin content management, Prisma-backed data, and Sentry monitoring.

Current stack:
- Next.js 16 App Router
- React 19
- TypeScript with `strict: true`
- Prisma 7 with `@prisma/adapter-libsql`
- SQLite/libsql runtime connection
- `next-intl` for locale support
- Optional Clerk auth/provider wiring
- Tailwind CSS v4 plus Lightswind plugin
- Sentry for server, edge, and client monitoring

Source-of-truth anchors:
- `package.json`
- `next.config.ts`
- `prisma/schema.prisma`
- `src/lib/prisma.ts`

Important notes:
- Treat current config files as source of truth over README when they disagree.
- Public site, admin surfaces, and API handlers all live in the same Next.js repo.
- The app uses standalone output for deployment.