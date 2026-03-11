# Plan: Import Advisory Board Data

## Goal
Import the 67 records from `bancovan.json` into the new website's database corresponding to the "Hội đồng Cố vấn Khoa học" (Scientific Advisory Board).

## Data Analysis
- **Source**: `bancovan.json`
- **Ordering**: The `stt_hienthi` field determines the exact display order and structural hierarchy.
- **Hierarchy Detection**:
  - Records with an *empty* `anhdaidien` (avatar) and empty `chucvu`/`mieutangan` act as section headings or departments (e.g., "HỘI ĐỒNG", "BAN NGHIÊN CỨU KHOA HỌC").
  - Records with an `anhdaidien` are actual staff members belonging to the most recently declared department.
- **Title Extraction**: Some members have their title (e.g., "TRƯỞNG BAN") embedded inside the HTML of `mieutangan`. This will need to be preserved or extracted if possible, or we can just import the raw HTML into the `bio` field.

## Implementation Plan

### Phase 1: Planning (Completed)
- You are reading this plan.

### Phase 2: Implementation (Parallel Agents)

#### Agent 1: Backend Specialist (`scripts/migrate-bancovan.mjs`)
1.  **Prerequisites**:
    - Load `.env.local` for Cloudinary credentials.
    - Connect to Prisma.
2.  **Schema Preparation**:
    - Create/Find a `StaffType` named "Hội đồng Cố vấn Khoa học" (slug: `hoi-dong-co-van-khoa-hoc`, level: 2).
3.  **Data Processing**:
    - Read `bancovan.json` and sort by `stt_hienthi` ascending.
    - Track `currentDepartmentId`.
    - Loop through records:
        - If it's a heading (empty `anhdaidien`): Create/Find a `Department` using its `name` under the new `StaffType`. Update `currentDepartmentId`.
        - If it's a person:
            1. Extract Cloudinary path from `anhdaidien`.
            2. Upload local image from `c:\Users\longt\Desktop\website\old\httpdocs` to Cloudinary (using existing uploader logic).
            3. Parse `mieutangan` to extract a clean title if `chucvu` is empty, or just use `mieutangan` as `bio` (fallback).
            4. Upsert `Staff` record linking to `currentDepartmentId` and the `StaffType`.

#### Agent 2: Test Engineer
1.  **Execution**: Run the migration script.
2.  **Verification**: Write a short script verifying the DB has the "Hội đồng Cố vấn Khoa học" StaffType, expected Departments, and Staff members correctly linked. Check specifically for "GS.TS. HỒ ĐỨC HÙNG".

## Output
- Data migrated successfully to the database.
- Images uploaded to Cloudinary.
