# Reviews Section (RAD Specification)

## Objective
Define the exact data schema, layout behavior, and admin interface for the `ReviewsSection` component.

## 1. Visual Specification
- **Component**: `src/components/sections/ReviewsSection.tsx`
- **Layout**: Often a stylized carousel or masonry layout of testimonial cards. Include a standard section header.
- **Dynamic Elements**:
  - Section Title
  - Section Subtitle
  - Testimonial display count.

## 2. TypeScript Schema (`interface`)
For `SiteConfiguration` record key `"reviews"`.

```typescript
export interface ReviewsConfig {
  title: string;
  subtitle: string;
  displayCount: number;
}
```

## 3. Frontend Fallbacks (Null Object Pattern)
```typescript
export const DEFAULT_REVIEWS_CONFIG: ReviewsConfig = {
    title: "Cảm Nhận Học Viên",
    subtitle: "Lắng nghe chia sẻ từ những người đã đồng hành cùng chúng tôi",
    displayCount: 5
};
```

## 4. Admin Dashboard UI Mapping
When the admin edits the "Reviews" section:
- **Section Title**: Text Input (Required)
- **Section Subtitle**: Textarea (Required)
- **Display Count**: Number Input (Default: 5)
