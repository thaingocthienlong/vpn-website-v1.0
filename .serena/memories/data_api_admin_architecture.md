# Data, API, And Admin Architecture

Data model:
- Prisma schema is a CMS-style model with content, taxonomy, media, staff, partners, registrations, contact forms, reviews, configuration, homepage sections, and menu items.
- Localization is mostly column-based via `*_en` fields, not separate translation tables.
- Services are convention-based rather than a first-class model: `Page` rows with `template="service"` plus `ContentSection` rows.

Prisma wiring:
- Runtime Prisma client is in `src/lib/prisma.ts`.
- The app uses `@prisma/adapter-libsql` with SQLite/libsql behavior.
- Schema datasource is `sqlite` in `prisma/schema.prisma`.

Service/API shape:
- Public routes mix direct Prisma reads with service-module reads.
- Important service files include `src/lib/services/site-content.ts`, `src/lib/services/api-services.ts`, and `src/lib/homepage-service.ts`.
- Admin API handlers are mostly CRUD-style endpoints under `src/app/api/admin`.
- Admin UI pages under `src/app/admin` are mostly client pages that fetch those endpoints after hydration.

Highest-signal risks to remember:
- Some admin endpoints appear to have weak or missing protection.
- `requireAdmin()` in `src/lib/admin-auth.ts` behaves more like authentication than strong authorization and should be reviewed carefully before trusting admin boundaries.
- `src/app/api/patch/route.ts` is a public mutation route and is a major boundary risk.
- API response shapes are inconsistent across public and admin handlers, which increases frontend coupling.
- The service layer is split, so data transformations can drift between direct route queries and shared service helpers.
- `ContentSection(entityType, entityId)` relies on conventions rather than strong foreign-key enforcement.