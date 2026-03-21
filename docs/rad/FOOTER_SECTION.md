# Footer Section (RAD Specification)

## Objective
Define the exact data schema, layout behavior, and admin interface for the `Footer` component.

## 1. Visual Specification
- **Component**: `src/components/layout/Footer.tsx`
- **Layout**: Multi-column bottom layout. Standard sections include Logo & Description, Quick Links, Legal Links, and Social Media icons.
- **Dynamic Elements**:
  - Company Info (Name, Address, Phone, Email)
  - Social Links
  - Footer Links Columns
  - Copyright Text

## 2. TypeScript Schema (`interface`)
This interface dictates the JSON structure for the `SiteConfiguration` record under key `"footer"`.

```typescript
export interface SocialLink {
  platform: 'facebook' | 'youtube' | 'linkedin' | 'tiktok' | 'twitter';
  url: string;
}

export interface FooterLinkColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface FooterConfig {
  companyName: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  socials: SocialLink[];
  columns: FooterLinkColumn[];
  copyright: string;
}
```

## 3. Frontend Fallbacks (Null Object Pattern)
```typescript
export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
    companyName: "Viện Sinh thái Nghề nghiệp (SISRD)",
    description: "Nỗ lực nghiên cứu, bảo tồn và phát triển các hệ sinh thái và môi trường nhằm mục tiêu phát triển bền vững.",
    address: "123 Đường Bền Vững, Quận 1, Tp. Hồ Chí Minh",
    phone: "0123 456 789",
    email: "contact@sisrd.org",
    socials: [
        { platform: 'facebook', url: "#" },
        { platform: 'youtube', url: "#" }
    ],
    columns: [
        {
            title: "Liên Kết Nhanh",
            links: [
                { label: "Giới thiệu", href: "/about" },
                { label: "Đào tạo", href: "/training" },
                { label: "Tin tức", href: "/news" }
            ]
        },
        {
            title: "Pháp Lý",
            links: [
                { label: "Chính sách bảo mật", href: "/privacy" },
                { label: "Điều khoản sử dụng", href: "/terms" }
            ]
        }
    ],
    copyright: "© 2024 SISRD. All rights reserved."
};
```

## 4. Admin Dashboard UI Mapping
When the admin edits the "Footer" section:
- **Company Info**: Standard text inputs.
- **Social Links**: Dynamic list mapping platform icons to URLs.
- **Link Columns**: Array of arrays for building 2-3 columns of links.
- **Copyright**: Text Input.
