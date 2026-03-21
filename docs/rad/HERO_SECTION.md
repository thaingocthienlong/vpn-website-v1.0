# Hero Section (RAD Specification)

## Objective
Define the exact data schema, layout behavior, and admin interface for the `HeroSection` component.

## 1. Visual Specification
- **Component**: `src/components/sections/HeroSection.tsx`
- **Layout**: Full-screen height (`min-h-screen`) hero image/video background with a gradient overlay to ensure text readability. Content is centered or left-aligned on desktop, usually with a bold primary heading (`h1`), subtitle, and call-to-action buttons.
- **Dynamic Elements**: 
  - Background Video or Image URL
  - Primary Headline
  - Subtitle
  - Primary CTA (Text + URL)
  - Secondary CTA (Text + URL)
  - Optional: Featured courses cards overlaying the bottom.

## 2. TypeScript Schema (`interface`)
This interface dictates the exact JSON structure that must be saved in the `SiteConfiguration` database record under the key `"hero"`.

```typescript
export interface CTAConfig {
  text: string;
  href: string;
}

export interface HeroConfig {
  title: string;
  subtitle: string;
  videoUrl: string; // Used as the background video
  ctaPrimary?: CTAConfig;
  ctaSecondary?: CTAConfig;
  featuredCourseIds: string[]; // Array of course IDs to fetch and display 
}
```

## 3. Frontend Fallbacks (Null Object Pattern)
To guarantee the frontend never crashes if the database is empty or the config is null, the frontend component must merge any fetched data with this fallback constant.

```typescript
export const DEFAULT_HERO_CONFIG: HeroConfig = {
    title: "VẬN HÀNH BỀN VỮNG - KIẾN TẠO TƯƠNG LAI",
    subtitle: "Viện Sinh thái Nghề nghiệp (SISRD) nỗ lực nghiên cứu, bảo tồn và phát triển các hệ sinh thái và môi trường nhằm mục tiêu phát triển bền vững. Chúng tôi tập trung vào việc nghiên cứu đa dạng sinh học và đào tạo nâng cao năng lực nghề nghiệp.",
    videoUrl: "https://videos.pexels.com/video-files/3163534/3163534-hd_1920_1080_30fps.mp4",
    ctaPrimary: {
        text: "Tìm hiểu thêm",
        href: "/about"
    },
    ctaSecondary: {
        text: "Các chương trình đào tạo",
        href: "/programs"
    },
    featuredCourseIds: [] 
};
```

## 4. Admin Dashboard UI Mapping
When the admin edits the "Hero" section, the form should render the following inputs:
- **Title**: Text Input (Required)
- **Subtitle**: Textarea (Required)
- **Video URL**: Text Input (Required) - Optionally an asset picker if integrated with file uploads.
- **Primary CTA Text**: Text Input
- **Primary CTA Link**: Text Input
- **Secondary CTA Text**: Text Input
- **Secondary CTA Link**: Text Input
- **Featured Courses**: Multi-Select Dropdown (fetches from `/api/courses`) allowing the user to select up to 3 courses.
