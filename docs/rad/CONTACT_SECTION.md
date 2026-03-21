# Contact Section (RAD Specification)

## Objective
Define the exact data schema, layout behavior, and admin interface for the `ContactSection` component.

## 1. Visual Specification
- **Component**: `src/components/sections/ContactSection.tsx`
- **Layout**: Typically split layout: Left side contains contact information (address, phone, email, hours), right side contains an embedded map or a contact form.
- **Dynamic Elements**:
  - Section Title & Subtitle
  - Address
  - Phone Number
  - Email Address
  - Working Hours

## 2. TypeScript Schema (`interface`)
For `SiteConfiguration` record key `"contact"`.

```typescript
export interface ContactConfig {
  title: string;
  subtitle: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
}
```

## 3. Frontend Fallbacks (Null Object Pattern)
```typescript
export const DEFAULT_CONTACT_CONFIG: ContactConfig = {
    title: "Liên Hệ",
    subtitle: "Kết nối với chúng tôi để được tư vấn chi tiết",
    address: "123 Đường Bền Vững, Quận 1, Tp. Hồ Chí Minh",
    phone: "0123 456 789",
    email: "contact@sisrd.org",
    hours: "Thứ 2 - Thứ 6: 08:00 - 17:00"
};
```

## 4. Admin Dashboard UI Mapping
When the admin edits the "Contact" section:
- **Section Title**: Text Input (Required)
- **Section Subtitle**: Textarea (Required)
- **Address**: Text Input (Required)
- **Phone**: Text Input (Required)
- **Email**: Email Input (Required)
- **Working Hours**: Text Input (Required)
