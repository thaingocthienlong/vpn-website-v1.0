# Header Section (RAD Specification)

## Objective
Define the exact data schema, layout behavior, and admin interface for the `Header` / `Navbar` component.

## 1. Visual Specification
- **Component**: `src/components/layout/Header.tsx` & `Navbar.tsx`
- **Layout**: Top navigation bar, sticky on scroll, featuring site logo, primary navigation links, language switcher, and mobile menu hamburger.
- **Dynamic Elements**:
  - Site Logo (Light & Dark variants if applicable)
  - Navigation Links
  - Top bar text (e.g. phone number or email)

## 2. TypeScript Schema (`interface`)
This interface dictates the exact JSON structure for the `SiteConfiguration` record under key `"navbar"`.

```typescript
export interface NavLink {
  label: string;
  href: string;
}

export interface NavbarConfig {
  logoUrl: string;
  links: NavLink[];
  topBarText?: string;
  actionButtonText?: string;
  actionButtonUrl?: string;
}
```

## 3. Frontend Fallbacks (Null Object Pattern)
```typescript
export const DEFAULT_NAVBAR_CONFIG: NavbarConfig = {
    logoUrl: "/images/sisrd-logo.png",
    links: [
        { label: "Trang chủ", href: "/" },
        { label: "Giới thiệu", href: "/about" },
        { label: "Hoạt động", href: "/activities" },
        { label: "Đào tạo", href: "/training" },
        { label: "Tin tức", href: "/news" },
        { label: "Liên hệ", href: "/contact" }
    ],
    actionButtonText: "Đăng Ký Khóa Học",
    actionButtonUrl: "/dang-ky"
};
```

## 4. Admin Dashboard UI Mapping
When the admin edits the "Navbar" section:
- **Logo URL**: File Upload / Text Input
- **Top Bar Text**: Text Input
- **Action Button Text**: Text Input
- **Action Button Link**: Text Input
- **Navigation Links**: A dynamic list builder where admins can add/remove menu items (Label + URL).
