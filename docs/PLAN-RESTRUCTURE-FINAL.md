# Plan: Re-evaluate and Restructure Organizational Data

## Problem
1. **Database Relationship Mess**: `banlanhdao.json` has its objects out of numerical order. Because the initial migration script read it sequentially without sorting by `stt_hienthi`, staff members were assigned to completely wrong departments (or no department).
2. **UI Mixing**: The user wants `banlanhdao` strictly in `/gioi-thieu/co-cau-to-chuc` exactly mimicking the old site, and "Hội đồng Cố vấn Khoa học" (`bancovan.json`) on a separate page.

## Proposed Solution

### Phase 1: Planning (Completed)
- You are reviewing this plan.

### Phase 2: Implementation (Parallel Agents)

#### Agent 1: Database Architect (`scripts/remigrate-banlanhdao.mjs`)
- **Objective**: Fix associations in the database.
- **Tasks**:
  1. Write a script `remigrate-banlanhdao.mjs`.
  2. Read `banlanhdao.json`, **SORT** the array by `stt_hienthi` ascending.
  3. Iterate through to keep track of `currentDepartmentId`.
  4. Update each existing `Staff` record to have the correct `departmentId` based on the sorted hierarchy.
  5. Assign `StaffType` to all of them simply as 'Ban Lãnh Đạo Viện', or standard types, but the UI shouldn't use `StaffType` to group them anymore; it should group purely by `Department`.

#### Agent 2: Frontend Specialist (`page.tsx` & routing)
- **Objective**: Fix the UI and create a new page for Advisory Board.
- **Tasks**:
  1. **Rewrite `src/app/[locale]/gioi-thieu/co-cau-to-chuc/page.tsx`**:
     - Fetch staff who are NOT in `Hội đồng Cố vấn Khoa học`.
     - Extract the Viện Trưởng (the one without a Department).
     - Fetch `Departments` (only those matching the `banlanhdao.json` ones: Trung tâm Đào tạo, Quan hệ Cộng đồng, Hành chính, KH & QH Quốc tế, Văn phòng) and display them with their staff inside, matching the exact flow of the old website.
  2. **Create `src/app/[locale]/gioi-thieu/hoi-dong-co-van-khoa-hoc/page.tsx`**:
     - Fetch only staff from "Hội đồng Cố vấn Khoa học".
     - Display the Advisory Board structure here (Hội đồng, Ban chuyên môn, etc.).

#### Agent 3: Test Engineer
- **Objective**: Verification.
- **Tasks**:
  1. Run the `remigrate-banlanhdao.mjs` script.
  2. Run the `test-org-structure.mjs` script to verify Viện trưởng is top level, and departments map correctly.
  3. Verify the frontend routes `/gioi-thieu/co-cau-to-chuc` and `/gioi-thieu/hoi-dong-co-van-khoa-hoc` compile and render the correct data subsets.
