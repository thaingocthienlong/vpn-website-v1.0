# Homepage Hover / Scroll / Responsive Audit

## States Verified

- Header pre-scroll on desktop
- Header scrolled on desktop
- Header closed/open on mobile
- Language toggle on VI and EN routes
- Hero featured-program rail on desktop
- Hero featured-program rail on tablet/mobile
- Training `View all programs` button default and hover
- Services CTA button default and hover
- Gallery active image selection
- Gallery thumbnail pagination
- Contact/register default, focus, submitting, success, and timed reset
- Footer readability on the paper-grid surface

## Screenshot Checklist

- [x] Header top desktop
- [x] Header scrolled desktop
- [x] Header mobile closed
- [x] Header mobile open
- [x] Hero tablet
- [x] Hero mobile
- [x] Training CTA hover
- [x] Services CTA hover
- [x] Gallery desktop with active image + thumbnail grid
- [x] Gallery mobile stacked layout
- [x] Contact/register desktop
- [x] Contact/register mobile
- [x] Footer desktop
- [x] Footer mobile

## Evidence

- `C:\Users\Vien Phuong Nam\Desktop\d7a8\web\homepage-refinement-top-desktop.png`
- `C:\Users\Vien Phuong Nam\Desktop\d7a8\web\homepage-refinement-scrolled-desktop.png`
- `C:\Users\Vien Phuong Nam\Desktop\d7a8\web\homepage-refinement-top-mobile.png`
- `C:\Users\Vien Phuong Nam\Desktop\d7a8\web\homepage-refinement-mobile-menu-open.png`
- `C:\Users\Vien Phuong Nam\Desktop\d7a8\web\homepage-refinement-training-cta-hover.png`
- `C:\Users\Vien Phuong Nam\Desktop\d7a8\web\homepage-refinement-services-cta-hover.png`
- `C:\Users\Vien Phuong Nam\Desktop\d7a8\web\homepage-refinement-gallery-desktop.png`
- `C:\Users\Vien Phuong Nam\Desktop\d7a8\web\homepage-refinement-endcap-success-desktop.png`
- `C:\Users\Vien Phuong Nam\Desktop\d7a8\web\homepage-refinement-footer-desktop.png`

## Verification Results

- Header top-state glass, hotline contrast, and locale toggle were verified on `/` and `/en`.
- Mobile header remains compact with the locale toggle and menu trigger sharing the utility row cleanly.
- The hero rail now keeps the first featured program on tablet/mobile and restores the full rail at desktop widths.
- Training and services CTAs match the intended hover contrast behavior.
- The gallery no longer opens a homepage lightbox; thumbnail selection updates the large preview and pagination cycles the `2 x 3` grid.
- The endcap form now verifies correctly through `idle -> submitting -> success -> timed reset`.
- The footer reads as a transparent paper-grid extension of the page instead of a separate dark box.

## Open Issues

- Footer legal links still point at routes that do not exist in the repo today:
  - `/chinh-sach-bao-mat`
  - `/dieu-khoan-su-dung`
  - `/en/privacy-policy`
  - `/en/terms`
- Some CMS-sourced summaries still expose HTML entities such as `th&aacute;ng` and `Th&ocirc;ng`; this is a content sanitization issue outside this UI refinement pass.
