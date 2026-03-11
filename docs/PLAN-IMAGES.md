# Plan: Partner Image Migration (Local Source)

## Goal
Migrate partner logos from the local `uploads` folder to Cloudinary (as AVIF) and update the database.

## Context
- **Source Folder**: `c:\Users\longt\Desktop\website\new\uploads`
- **Data Source**: `database/doitac.json` and `database/donvilienket.json` (to map Partner Name -> Image Path).
- **Target**: Cloudinary (Folder: `vpn/partners`, Format: `avif`).

## Steps

### 1. Preparation
- Install `sharp` (if needed for local conversion, or rely on Cloudinary). *Decision: Use Cloudinary `format: 'avif'` option.*
- Verify `uploads/files/Logo doi tac` exists. (Verified)

### 2. Migration Script (`scripts/migrate-partner-images-local.mjs`)
- **Logic**:
    1. Load `doitac.json` and `donvilienket.json`.
    2. Iterate through each record.
    3. Find the corresponding `Partner` in the DB by `name`.
    4. Construct the local file path from the JSON `image` field (e.g., `/uploads/files/Logo doi tac/abc.jpg` -> `.../new/uploads/files/Logo doi tac/abc.jpg`).
    5. Check if file exists locally.
    6. **Upload to Cloudinary**:
        - Use `cloudinary.uploader.upload`.
        - Options: `folder: 'vpn/partners'`, `format: 'avif'`, `public_id`: derived from name.
    7. **Update Database**:
        - Create `Media` record with the new Cloudinary URL.
        - Update `Partner` record to link `logoId`.

### 3. Verification
- Run script.
- Check `Media` table count.
- Check Homepage (partners should have logos).

## User Review Required
- Confirm Cloudinary credentials are active.
