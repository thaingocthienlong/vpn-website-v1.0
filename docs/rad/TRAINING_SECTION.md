# Training Section (RAD Specification)

## Objective
Define the exact data schema, layout behavior, and admin interface for the `TrainingSection` (Courses) component.

## 1. Visual Specification
- **Component**: `src/components/sections/TrainingSection.tsx`
- **Layout**: Features a section header and a grid of `CourseCard` components.
- **Dynamic Elements**:
  - Section Title
  - Section Subtitle
  - Maximum courses to display

## 2. TypeScript Schema (`interface`)
This interface dictates the exact JSON structure that must be saved in the `SiteConfiguration` database record under the key `"training"`.

```typescript
export interface TrainingConfig {
  title: string;
  subtitle: string;
  displayCount: number;
}
```

## 3. Frontend Fallbacks (Null Object Pattern)
To guarantee the frontend never crashes if the database is empty or the config is null, the frontend component must merge any fetched data with this fallback constant.

```typescript
export const DEFAULT_TRAINING_CONFIG: TrainingConfig = {
    title: "Chương Trình Đào Tạo",
    subtitle: "Nâng cao năng lực và phát triển nghề nghiệp bền vững",
    displayCount: 3
};
```

## 4. Admin Dashboard UI Mapping
When the admin edits the "Training" section, the form should render the following inputs:
- **Section Title**: Text Input (Required)
- **Section Subtitle**: Textarea (Required)
- **Display Count**: Number Input (Default: 3). How many top/recent courses to fetch and show on the homepage.
