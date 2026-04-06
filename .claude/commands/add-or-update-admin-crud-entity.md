---
name: add-or-update-admin-crud-entity
description: Workflow command scaffold for add-or-update-admin-crud-entity in vpn-website-v1.0.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-admin-crud-entity

Use this workflow when working on **add-or-update-admin-crud-entity** in `vpn-website-v1.0`.

## Goal

Adds or updates an admin CRUD interface for a new or existing entity (e.g., services, reviews, advisory, partners, staff, courses, etc.), including admin pages and corresponding API routes.

## Common Files

- `src/app/admin/[locale]/*/page.tsx`
- `src/app/api/admin/*/route.ts`
- `src/app/api/admin/*/[id]/route.ts`
- `src/components/cards/*.tsx`
- `prisma/schema.prisma`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update admin pages under src/app/admin/[locale]/<entity>/(create|[id]|page).tsx
- Create or update API routes under src/app/api/admin/<entity>/(route.ts|[id]/route.ts)
- Update or create related components (e.g., cards, forms) under src/components/cards or similar
- Update or create database schema in prisma/schema.prisma if needed
- Update types or config files if needed

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.