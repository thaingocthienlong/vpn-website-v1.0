```markdown
# vpn-website-v1.0 Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you the core development patterns, coding conventions, and operational workflows for the `vpn-website-v1.0` project—a Next.js web application written in TypeScript. The repository emphasizes modularity, maintainability, and deployment on shared hosting environments. It includes structured approaches for CRUD admin interfaces, API endpoint management, deployment optimization, and database schema evolution using Prisma.

---

## Coding Conventions

### File Naming

- Use **camelCase** for file and directory names.
  - Example: `apiServices.ts`, `userProfileCard.tsx`

### Imports

- Use **alias-based imports** for internal modules.
  - Example:
    ```typescript
    import apiServices from '@/lib/services/apiServices';
    import UserProfileCard from '@/components/cards/userProfileCard';
    ```

### Exports

- Use **default exports** for modules and components.
  - Example:
    ```typescript
    // src/components/cards/userProfileCard.tsx
    const UserProfileCard = () => { /* ... */ };
    export default UserProfileCard;
    ```

### Commit Messages

- Follow **Conventional Commits**:
  - Prefixes: `fix`, `feat`, `chore`, `deploy`
  - Example: `feat: add admin CRUD for partners entity`

---

## Workflows

### Add or Update Admin CRUD Entity

**Trigger:** When you need to add or update CRUD management for an entity in the admin dashboard.  
**Command:** `/new-admin-crud-entity`

1. **Create or update admin pages** under `src/app/admin/[locale]/<entity>/(create|[id]|page).tsx`.
   - Example: `src/app/admin/en/partners/create.tsx`
2. **Create or update API routes** under `src/app/api/admin/<entity>/(route.ts|[id]/route.ts)`.
   - Example: `src/app/api/admin/partners/route.ts`
3. **Update or create related components** (e.g., cards, forms) under `src/components/cards` or similar.
   - Example: `src/components/cards/partnerCard.tsx`
4. **Update or create database schema** in `prisma/schema.prisma` if needed.
   - Example:
     ```prisma
     model Partner {
       id    Int    @id @default(autoincrement())
       name  String
       // ...
     }
     ```
5. **Update types or config files** if needed.

---

### Add or Update API Endpoint

**Trigger:** When you want to expose new backend functionality or data via API.  
**Command:** `/new-api-endpoint`

1. **Create or update API route file** under `src/app/api/<entity>/(route.ts|[slug]/route.ts|[id]/route.ts)`.
   - Example: `src/app/api/services/route.ts`
2. **Update or create related service/util files** (e.g., `src/lib/services/apiServices.ts`).
   - Example:
     ```typescript
     // src/lib/services/apiServices.ts
     export default {
       async getServices() { /* ... */ },
       // ...
     };
     ```
3. **Update or create related database schema** in `prisma/schema.prisma` if needed.
4. **Update types or config files** if needed.

---

### Deploy Pipeline Optimization for Shared Hosting

**Trigger:** When you need to ensure the project builds and deploys reliably on constrained shared hosting environments (e.g., Plesk).  
**Command:** `/optimize-deploy-pipeline`

1. **Update build scripts** (e.g., `scripts/build-standalone.mjs`).
2. **Update `package.json` scripts and dependencies**.
   - Example:
     ```json
     "scripts": {
       "build:standalone": "node scripts/build-standalone.mjs"
     }
     ```
3. **Update Next.js config** (`next.config.ts`) for build constraints.
4. **Update Prisma config or schema** if needed.
5. **Document changes** in `docs/PLAN.md` or similar.

---

### Data Migration and Schema Evolution

**Trigger:** When you want to introduce new data models, migrate data, or refactor existing database structures.  
**Command:** `/migrate-data`

1. **Update `prisma/schema.prisma`** with new or changed models.
2. **Create or update migration scripts** under `scripts/`.
   - Example: `scripts/migrate-partners.ts`
3. **Update backend logic** (e.g., `src/lib/services/apiServices.ts`, `server.js`).
4. **Document migration steps** in `README` or `docs`.

---

## Testing Patterns

- **Test files** use the pattern: `*.test.*`
  - Example: `userProfileCard.test.tsx`
- **Testing framework:** Not explicitly detected—refer to project documentation or inspect test files for details.
- **Placement:** Test files are typically placed alongside the modules/components they test.

---

## Commands

| Command                  | Purpose                                                      |
|--------------------------|--------------------------------------------------------------|
| /new-admin-crud-entity   | Scaffold or update an admin CRUD interface for an entity     |
| /new-api-endpoint        | Add or update an API endpoint and related backend logic      |
| /optimize-deploy-pipeline| Optimize build and deployment for shared hosting             |
| /migrate-data            | Perform data migrations and evolve the Prisma schema         |
```
