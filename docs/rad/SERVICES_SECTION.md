# Services Section (RAD Specification)

## Objective
Define the exact data schema, layout behavior, and admin interface for the `ServicesSection` component.

## 1. Visual Specification
- **Component**: `src/components/sections/ServicesSection.tsx`
- **Layout**: Grid layout (usually 3 columns on desktop, 1 on mobile). Displays a section header (title, subtitle) and cards representing different services.
- **Dynamic Elements**:
  - Section Title
  - Section Subtitle
  - Services List: Currently hardcoded in the component but could be made dynamic or fetchable if they are database entities. For the MVP, we only control the section headers, but the standard pattern is mapped.

## 2. TypeScript Schema (`interface`)
This interface dictates the exact JSON structure that must be saved in the `SiteConfiguration` database record under the key `"services"`.

```typescript
export interface ServicesConfig {
  title: string;
  subtitle: string;
}
```

## 3. Frontend Fallbacks (Null Object Pattern)
To guarantee the frontend never crashes if the database is empty or the config is null, the frontend component must merge any fetched data with this fallback constant.

```typescript
export const DEFAULT_SERVICES_CONFIG: ServicesConfig = {
    title: "Lĩnh Vực Hoạt Động",
    subtitle: "Khám phá các lĩnh vực chuyên sâu của chúng tôi"
};
```

## 4. Admin Dashboard UI Mapping
When the admin edits the "Services" section, the form should render the following inputs:
- **Section Title**: Text Input (Required)
- **Section Subtitle**: Textarea (Required)
*(Note: Adding dynamic services management would happen in a separate standalone feature, like a Courses CMS).*
