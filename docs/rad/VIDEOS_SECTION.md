# Videos Section (RAD Specification)

## Objective
Define the exact data schema, layout behavior, and admin interface for the `VideosSection` component.

## 1. Visual Specification
- **Component**: `src/components/sections/VideosSection.tsx`
- **Layout**: Displays a section header. The main content is typically a grid or carousel of video thumbnails that open modal players or link directly to YouTube/etc.
- **Dynamic Elements**:
  - Section Title
  - Section Subtitle
  - Maximum videos to display

## 2. TypeScript Schema (`interface`)
This interface dictates the exact JSON structure that must be saved in the `SiteConfiguration` database record under the key `"videos"`.

```typescript
export interface VideosConfig {
  title: string;
  subtitle: string;
  displayCount: number;
}
```

## 3. Frontend Fallbacks (Null Object Pattern)
To guarantee the frontend never crashes if the database is empty or the config is null.

```typescript
export const DEFAULT_VIDEOS_CONFIG: VideosConfig = {
    title: "Video Nổi Bật",
    subtitle: "Khám phá các hoạt động và chia sẻ từ chuyên gia",
    displayCount: 3
};
```

## 4. Admin Dashboard UI Mapping
When the admin edits the "Videos" section:
- **Section Title**: Text Input (Required)
- **Section Subtitle**: Textarea (Required)
- **Display Count**: Number Input (Default: 3). How many top/recent videos to fetch and show on the homepage.
*(Note: Adding specific videos to feature manually vs fetching the most recent will be managed in the Videos CMS entity, not here).*
