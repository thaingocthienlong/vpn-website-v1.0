# CTA Section (RAD Specification)

## Objective
Define the exact data schema, layout behavior, and admin interface for the `CTASection` component.

## 1. Visual Specification
- **Component**: `src/components/sections/CTASection.tsx`
- **Layout**: A strong, solid background banner drawing attention to a primary call to action before the footer.
- **Dynamic Elements**:
  - Main Heading
  - Description / Subtitle
  - Primary Button (Text + URL)

## 2. TypeScript Schema (`interface`)
For `SiteConfiguration` record key `"cta"`.

```typescript
export interface CTAButtonConfig {
  text: string;
  href: string;
}

export interface CTASectionConfig {
  title: string;
  subtitle: string;
  button: CTAButtonConfig;
}
```

## 3. Frontend Fallbacks (Null Object Pattern)
```typescript
export const DEFAULT_CTA_CONFIG: CTASectionConfig = {
    title: "Sẵn sàng Kiến tạo Tương lai?",
    subtitle: "Tham gia cùng chúng tôi để phát triển sự nghiệp bền vững",
    button: {
        text: "Liên Hệ Ngay",
        href: "/contact"
    }
};
```

## 4. Admin Dashboard UI Mapping
When the admin edits the "CTA Ribbon" section:
- **Title**: Text Input (Required)
- **Subtitle**: Textarea (Required)
- **Button Text**: Text Input (Required)
- **Button Link URL**: Text Input (Required)
