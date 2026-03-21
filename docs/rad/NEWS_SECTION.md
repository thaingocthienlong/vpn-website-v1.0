# News Section (RAD Specification)

## Objective
Define the exact data schema, layout behavior, and admin interface for the `NewsSection` component.

## 1. Visual Specification
- **Component**: `src/components/sections/NewsSection.tsx`
- **Layout**: Displays a section header and a grid of recent blog posts or news articles in standard cards.
- **Dynamic Elements**:
  - Section Title
  - Section Subtitle
  - Maximum news articles to display

## 2. TypeScript Schema (`interface`)
This interface dictates the exact JSON structure for the `SiteConfiguration` record under key `"news"`.

```typescript
export interface NewsConfig {
  title: string;
  subtitle: string;
  displayCount: number;
}
```

## 3. Frontend Fallbacks (Null Object Pattern)
```typescript
export const DEFAULT_NEWS_CONFIG: NewsConfig = {
    title: "Tin Tức & Sự Kiện",
    subtitle: "Cập nhật những thông tin mới nhất từ SISRD",
    displayCount: 3
};
```

## 4. Admin Dashboard UI Mapping
When the admin edits the "News" section:
- **Section Title**: Text Input (Required)
- **Section Subtitle**: Textarea (Required)
- **Display Count**: Number Input (Default: 3)
