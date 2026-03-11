# Plan: Restructure Organizational & Advisory Data

## Problem Analysis
The user identified that both "Cơ cấu tổ chức" (Org Structure) and "Hội đồng Cố vấn Khoa học" (Advisory Board) appear as a "mess".
Our investigation (`analyze-staff-structure.mjs` and reading `page.tsx`) revealed two root causes:
1. **Frontend UI Mixing**: The `OrgStructurePage` fetches all `Staff` where `level > 1` and groups them by `Department`. This causes the 62 Advisory Board members to be interleaved with the regular administrative departments, making the page extremely long and disorganized.
2. **Database Clutter**: The initial `migrate-staff.mjs` script incorrectly used `upsert` without a unique identifier, resulting in over 50 duplicate, empty `StaffType` records.

## Proposed Solution & Redevelopment

### Phase 1: Planning (Completed)
- You are reviewing this plan.

### Phase 2: Implementation (Parallel Agents)

#### Agent 1: Database Architect (`scripts/clean-staff-db.mjs`)
- **Objective**: Clean up the database clutter.
- **Tasks**:
  1. Identify all `StaffType` records that have exactly `0` associated staff members.
  2. Delete these orphaned `StaffType` records to restore database hygiene.
  3. Ensure the core `StaffType` records remain: "Ban Lãnh Đạo", "Cán Bộ Quản Lý", "Chuyên viên", and "Hội đồng Cố vấn Khoa học".

#### Agent 2: Frontend Specialist (`src/app/[locale]/gioi-thieu/co-cau-to-chuc/page.tsx`)
- **Objective**: Redevelop the Org Structure UI to strictly separate the hierarchies.
- **Tasks**:
  1. Fetch all active staff with their `StaffType` and `Department`.
  2. Divide the UI into **3 distinct vertical sections**:
     - **Phần 1: Ban Lãnh Đạo (Executive Board)**
       - Display members where `staffType.name === 'Ban Lãnh Đạo'`.
     - **Phần 2: Hội đồng Cố vấn Khoa học (Scientific Advisory Board)**
       - Display members where `staffType.name === 'Hội đồng Cố vấn Khoa học'`.
       - Group these internally by their Department (Ban Nghiên cứu, Ban Đối ngoại, etc.).
       - The department "HỘI ĐỒNG" (Chủ tịch, Phó chủ tịch) should appear first in this section.
     - **Phần 3: Các Phòng Ban & Trung Tâm (Administrative Departments & Centers)**
       - Display members where `staffType.name === 'Cán Bộ Quản Lý'` or `'Chuyên viên'`.
       - Group these internally by their Department (Phòng Hành chính, Khối Văn phòng, v.v.).

#### Agent 3: Test Engineer
- **Objective**: Verify the changes.
- **Tasks**:
  1. Run the database cleanup script and verify no empty duplicates remain.
  2. Start the development server and visually inspect the local `/gioi-thieu/co-cau-to-chuc` page to ensure the 3 sections are rendered cleanly and accurately.
