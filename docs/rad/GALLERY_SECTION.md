# Gallery Section (RAD Specification)

## Objective
Define the exact data schema, layout behavior, and admin interface for the `GallerySection` component.

## 1. Visual Specification
- **Component**: `src/components/sections/GallerySection.tsx`
- **Layout**: Usually an image masonry or grid layout showcasing photos from events.
- **Dynamic Elements**:
  - Section Title
  - Section Subtitle
  - Images array (either fetched globally or specifically configured here). Given this is a homepage section, we might just configure the text and let the component fetch the newest images.

## 2. TypeScript Schema (`interface`)
For `SiteConfiguration` record key `"gallery"`.

```typescript
export interface GalleryConfig {
  title: string;
  subtitle: string;
}
```

## 3. Frontend Fallbacks (Null Object Pattern)
```typescript
export const DEFAULT_GALLERY_CONFIG: GalleryConfig = {
    title: "Thư Viện Hình Ảnh",
    subtitle: "Khoảnh khắc đáng nhớ từ các hoạt động của chúng tôi"
};
```

## 4. Admin Dashboard UI Mapping
When the admin edits the "Gallery" section:
- **Section Title**: Text Input (Required)
- **Section Subtitle**: Textarea (Required)
