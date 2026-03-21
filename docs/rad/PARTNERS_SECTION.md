# Partners Section (RAD Specification)

## Objective
Define the exact data schema, layout behavior, and admin interface for the `PartnersSection` component.

## 1. Visual Specification
- **Component**: `src/components/sections/PartnersSection.tsx`
- **Layout**: Usually an infinite scrolling marquee or a neat grid of partner logos in greyscale that tint on hover. Includes a standard section header.
- **Dynamic Elements**:
  - Section Title
  - Section Subtitle
  - Maximum partners to display (or boolean toggle to show all active).

## 2. TypeScript Schema (`interface`)
This interface dictates the JSON structure for the `SiteConfiguration` record under key `"partners"`.

```typescript
export interface PartnersConfig {
  title: string;
  subtitle: string;
  displayCount: number;
}
```

## 3. Frontend Fallbacks (Null Object Pattern)
```typescript
export const DEFAULT_PARTNERS_CONFIG: PartnersConfig = {
    title: "Đối Tác Kỷ Yếu",
    subtitle: "Đồng hành cùng các tổ chức uy tín",
    displayCount: 10
};
```

## 4. Admin Dashboard UI Mapping
When the admin edits the "Partners" section:
- **Section Title**: Text Input (Required)
- **Section Subtitle**: Textarea (Required)
- **Display Count**: Number Input (Default: 10)
