# PLAN: Re-import Organizational Data (Complete Reset)

## 📌 Problem Statement
The user reported that `Cơ cấu tổ chức` and `Hội đồng Cố vấn Khoa học` are still mixed up on the frontend (`/gioi-thieu/hoi-dong-co-van`), possibly due to residual data from earlier migration attempts or imperfect scripting. 

**Goal**: Wipe the existing data clean and execute a completely fresh, air-tight re-import from `banlanhdao.json` and `bancovan.json` ensuring 100% segregation.

## 🛠 Phase 1: Planning (Current)
This document outlines the strict 2-phase orchestration to completely reset the organizational structure data.

## 🚀 Phase 2: Implementation (Parallel Execution Modes)

### Agent 1: `database-architect` (Data Wipe & Re-Import)
1. **Script 1: Wipe DB (`scripts/wipe-staff.mjs`)**
   - Delete ALL records from `Staff`.
   - Delete ALL records from `StaffType`.
   - Delete ALL records from `Department` (that are related to these staff).
2. **Script 2: Import Ban Lãnh Đạo (`scripts/import-banlanhdao-v3.mjs`)**
   - Read `banlanhdao.json` and sort it STRICTLY by `stt_hienthi` ascending.
   - Create `StaffType`: "Ban Lãnh Đạo Viện" (Level 1).
   - Create Departments dynamically.
   - Insert staff under this specific `StaffType`. 
3. **Script 3: Import Hội Đồng Cố Vấn (`scripts/import-bancovan-v3.mjs`)**
   - Read `bancovan.json` and sort it STRICTLY by `stt_hienthi` ascending.
   - Create `StaffType`: "Hội đồng Cố vấn Khoa học" (Level 2).
   - Create isolated Departments dynamically (Ban Nghiên cứu, Ban Cố vấn, v.v.).
   - Insert staff under this specific `StaffType` to guarantee UI level segregation.

### Agent 2: `frontend-specialist` (UI Strict Filtering)
1. **Update `src/app/[locale]/gioi-thieu/co-cau-to-chuc/page.tsx`**:
   - Ensure it specifically queries `staffType.name === 'Ban Lãnh Đạo Viện'` and `Cán Bộ Quản Lý` / `Chuyên viên` if applicable, rigorously avoiding "Hội đồng Cố vấn Khoa học".
2. **Update `src/app/[locale]/gioi-thieu/hoi-dong-co-van-khoa-hoc/page.tsx`**:
   - Ensure it specifically queries ONLY `staffType.name === 'Hội đồng Cố vấn Khoa học'`.
3. Verify old routes (`/gioi-thieu/hoi-dong-co-van`) are either 404 removed or redirected safely to avoid cached/mixed-up old data.

### Agent 3: `test-engineer` (Verification)
1. Execute the 3 database scripts strictly in order.
2. Run database count verification to confirm EXACTLY 22 records for Ban Lãnh Đạo and 62 records for Hội đồng.
3. Using the `browser_subagent` or direct inspection, view both frontend pages again to ensure:
   - NO "Nguyễn Lâm Toàn" on the Advisory Board page.
   - Complete segregation is achieved.

---
**Next Step**: Wait for User Output explicitly approving this wipe-and-rebuild plan.
