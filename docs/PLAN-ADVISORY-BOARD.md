# Plan: Export Advisory Board Data

## Goal
The user requested to investigate and find the table containing records for the "Hội đồng Cố vấn Khoa học" (Scientific Advisory Board), specifically looking for "GS.TS. HỒ ĐỨC HÙNG", and then export that table into a JSON file.

## Investigation Results
Using an investigative script, the `Explorer Agent` found that the record for "GS.TS. HỒ ĐỨC HÙNG" is located in the table named `bancovan`.

## Implementation Plan

### Phase 1: Data Extraction (Backend Specialist)
1.  **Create Export Script**: Develop `scripts/export-bancovan.mjs`.
2.  **Parse SQL Dump**: 
    - Read `c:\Users\longt\Desktop\website\old\database\vie61786_vi_hl_cr.sql`.
    - Extract the table schema from `CREATE TABLE \`bancovan\`` to map the column names correctly.
    - Extract the data rows from `INSERT INTO \`bancovan\``.
3.  **Format JSON**: Map the SQL row values to JSON objects using the extracted column names.
4.  **Export**: Save the resulting array of JSON objects to `bancovan.json` in the root directory.

### Phase 2: Verification (Test Engineer)
1.  **Verify File**: Ensure `bancovan.json` is created and contains valid JSON syntax.
2.  **Verify Data**: Ensure the JSON file contains the record for "GS.TS. HỒ ĐỨC HÙNG" and matches the expected schema.
