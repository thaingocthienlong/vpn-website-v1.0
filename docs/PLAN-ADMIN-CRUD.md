# Plan: Admin Panel CRUD Audit

## Goal
Verify Create, Read, Update, Delete (CRUD) functionality for all Admin Panel management pages to identify and fix reported issues (specifically Partner deletion).

## Scope
The following modules will be tested:
1.  **Partners** (`/admin/partners`) - *Priority (Reported Issue)*
2.  **Categories** (`/admin/categories`)
3.  **Posts** (`/admin/posts`)
4.  **Services** (`/admin/services`)
5.  **Staff** (`/admin/staff`)
6.  **Courses** (`/admin/courses`)
7.  **Media** (`/admin/media`)
8.  **Contacts** (`/admin/contacts`) - *Read/Delete only*
9.  **Registrations** (`/admin/registrations`) - *Read/Delete only*

## Steps

### 1. Automated/Manual Verification (`test-engineer`)
For each module, perform the following actions manually (or via script if possible, but manual is more reliable for UI feedback):

*   **Create**: Add a new dummy record.
*   **Read**: Verify it appears in the list.
*   **Update**: Edit the record (change name/status). Verify change.
*   **Delete**: Remove the record. Verify it's gone.

### 2. Diagnosis (`debugger`)
*   If a step fails (e.g., Partner Delete), check:
    *   Network tab response (Status code, Error message).
    *   Server logs (Terminal output).
    *   Database constraints (Prisma schema).

### 3. Fix (`backend-specialist` / `frontend-specialist`)
*   Implement fixes for identified bugs.
*   For Partners: Suspect foreign key constraints (e.g., `Media`, `Course`, or other relations not handled in `DELETE`).

## User Review Required
*   Please proceed with the audit. report findings.
