# PLAN: Admin Homepage Fixes

## Context & Objectives
The user reported two issues on the Admin Homepage:
1. `courses.map is not a function` at `src/app/admin/homepage/AdminHomepageClient.tsx (283:58)`
2. The "Training" section isn't reflecting real data correctly on the website front-end and lacks an easy-to-use editor UI in the Admin panel.

## Root Cause Analysis
1. **`courses.map` TypeError**: 
   - The `/api/admin/courses` endpoint returns `jsonSuccess({ courses, meta })`. Behind the scenes, `jsonSuccess` wraps this in `{ success: true, data: { courses, meta } }`.
   - In `AdminHomepageClient.tsx`, `setCourses(coursesRes.data)` is called. This sets the state to an object `{ courses: [...], meta: ... }` instead of the required array `[]`, causing `.map` to crash when iterating over the returned data.
   - **Fix**: Update the state setter to `setCourses(coursesRes.data.courses || [])`.

2. **Training Section Not Manageable**:
   - Currently, `AdminHomepageClient.tsx` provides a dropdown interface specifically for the `hero` section to pick `featuredCourse1` and `featuredCourse2`. For the `training` section, it only provides a generic JSON Config textarea.
   - Furthermore, `src/app/[locale]/page.tsx` ignores any `featuredCourseIds` config for the `training` section, simply passing all featured courses returned by the DB directly to the `TrainingSection` component.
   - **Fix**: 
     - Update `AdminHomepageClient.tsx` to provide course selection dropdowns/checkboxes for the `training` section, mimicking the `hero` section but allowing users to select multiple courses (e.g. up to 6 or 9 courses).
     - Update `src/app/[locale]/page.tsx`'s `renderSection` function to use `sec.featuredCourseIds` for the `training` section so it only displays the selected courses mapping, falling back to all featured courses if none are explicitly selected.

---

## Task Breakdown

### Task 1: Fix TypeError in `AdminHomepageClient.tsx`
- **Location**: `src/app/admin/homepage/AdminHomepageClient.tsx`
- **Action**: Modify the data fetching `useEffect`:
  ```typescript
  if (coursesRes.success) {
      setCourses(coursesRes.data.courses || []);
  }
  ```

### Task 2: Implement Training Section Course Picker in Admin UI
- **Location**: `src/app/admin/homepage/AdminHomepageClient.tsx`
- **Action**: 
  - In the modal editor, explicitly handle `editingSection.sectionKey === "training"`.
  - Provide UI elements (like a multi-select or multiple dropdowns) bounded by `trainingListCourse` configs to let the admin select multiple `featuredCourseIds`.
  - Adjust the `saveEditor` function to save this custom array properly into the JSON string `configData`.

### Task 3: Apply `featuredCourseIds` context in Front-End
- **Location**: `src/app/[locale]/page.tsx`
- **Action**: 
  - Update `renderSection` for `case 'training':` to intercept `courses` via `courses.filter(c => sec.featuredCourseIds.includes(c.id))` just like the Hero section currently does.

## Required Agents for Implementation (PHASE 2)
1. **`frontend-specialist`**: To update the React components in `AdminHomepageClient.tsx` and `page.tsx` to correctly display options and fetch the right courses.
2. **`backend-specialist`** (if needed): To ensure payload integrity for JSON configs storing `featuredCourseIds` arrays via existing endpoints.
3. **`test-engineer`**: Execute validation checks to ensure UI successfully mounts and updates data without `courses.map` crashing.

## Verification Checklist
- [x] Admin panel homepage loads without `courses.map is not a function` crash.
- [x] Clicking "Edit" on the Training section shows an interface to select courses (instead of just generic JSON text).
- [x] Saving selects for the Training section updates the front-end display.
- [x] The public Homepage correctly reflects the precise courses chosen in the Admin Panel.
