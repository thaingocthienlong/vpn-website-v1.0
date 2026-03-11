# CRUD Management for Staff Taxonomy: Departments & Staff Types

This plan outlines the architecture required to change the "Phòng ban" (Department) and "Loại nhân sự" (Staff Type) drop-downs from static/indirect database queries into fully managed CRUD interfaces within the Admin Dashboard.

Both `Department` and `StaffType` models already exist in the Prisma schema, but currently lack dedicated Admin UI panels and complete API route handlers.

## User Review Required
None - this aligns with standard administrative CRUD patterns used elsewhere in the application.

## Proposed Changes

### 1. Backend REST API Expansion
Enhance the existing read-only endpoints to support full create, update, and delete actions.

#### [MODIFY] `src/app/api/admin/departments/route.ts`
- **POST**: Create a new department with `name`, `name_en`, `description`, `sortOrder`, `isActive`.

#### [NEW] `src/app/api/admin/departments/[id]/route.ts`
- **GET**: Fetch a specific department by ID.
- **PUT**: Update department details.
- **DELETE**: Delete a department.

#### [MODIFY] `src/app/api/admin/staff-types/route.ts`
- **POST**: Create a new staff type with `name`, `name_en`, `level`, `isAdvisory`, `sortOrder`.

#### [NEW] `src/app/api/admin/staff-types/[id]/route.ts`
- **GET**: Fetch a specific staff type by ID.
- **PUT**: Update staff type details.
- **DELETE**: Delete a staff type.

### 2. Admin Layout & Routing
Integrate the new sections into the sidebar navigation.

#### [MODIFY] `src/app/admin/layout.tsx`
- Add a new nested navigation block (e.g. `Danh mục`) or place these options directly under the `Quản lý` or `Nhân sự & Hội đồng` nested blocks. Let's add them as children inside the existing `Nhân sự & Hội đồng` block:
  - Child 3: `Phòng ban` -> href: `/admin/vi/departments` (or `[locale]`)
  - Child 4: `Loại nhân sự` -> href: `/admin/vi/staff-types`

### 3. Frontend Component Generation
Build standard data tables and form pages tailored to these entities schema.

#### [NEW] `src/app/admin/[locale]/departments/...`
- **`page.tsx`**: Table listing all Departments.
- **`create/page.tsx`**: Form to create a Department.
- **`[id]/page.tsx`**: Form to edit a Department.

#### [NEW] `src/app/admin/[locale]/staff-types/...`
- **`page.tsx`**: Table listing all Staff Types.
- **`create/page.tsx`**: Form to create a Staff Type.
- **`[id]/page.tsx`**: Form to edit a Staff Type.

---

## Verification Plan

### Automated Tests
1. `python .agent/skills/lint-and-validate/scripts/lint_runner.py .`

### Manual Verification
1. Access `/admin/vi/departments` and create a test department. Verify it appears in the list.
2. Edit the test department and delete it.
3. Repeat the CRUD test for `/admin/vi/staff-types`.
4. Open the Staff creation UI to verify the dropdowns dynamically fetch the active data accurately instead of relying strictly on old seed data.
