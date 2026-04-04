# Admin Model Coverage

This document maps the current Prisma schema to the admin surface after the admin realignment work.

## First-Class Admin Modules

| Prisma model | Admin surface | Notes |
| --- | --- | --- |
| `HomepageSection` | `/admin/site/homepage` | Managed as logical homepage sections aligned to the public renderer contract. |
| `MenuItem` | `/admin/site/navigation` | Managed together with header/footer navigation settings. |
| `Configuration` | `/admin/site/navigation`, `/admin/site/settings` | Managed through grouped site configuration editors rather than separate legacy mental models. |
| `Post` | `/admin/[locale]/posts` | Supports translated post editing and tag assignment. |
| `Tag` | `/admin/tags` | Dedicated CRUD module added in this realignment. |
| `Category` | `/admin/categories` | Existing first-class content taxonomy module. |
| `Course` | `/admin/[locale]/courses` | Existing first-class content module. |
| `Review` | `/admin/reviews` | Dedicated CRUD module added in this realignment. |
| `Department` | `/admin/departments` | Existing people taxonomy module. |
| `StaffType` | `/admin/staff-types` | Existing people taxonomy module. |
| `Staff` | `/admin/staff`, `/admin/advisory` | Existing people module split by domain surfaces. |
| `Partner` | `/admin/partners` | Existing people/content relationship module. |
| `Registration` | `/admin/registrations` | Existing operations module. |
| `ContactForm` | `/admin/contacts` | Existing operations module. |
| `Media` | `/admin/media` | Existing media library and sync tooling. |

## Managed Inside Parent Modules

| Prisma model | Owning admin module | Notes |
| --- | --- | --- |
| `Page` | `/admin/[locale]/services` | Service pages are edited as `Page(template=\"service\")` records. |
| `ContentSection` | `/admin/[locale]/services`, `/admin/[locale]/courses` | Service sections now follow the same structured editing pattern as course content sections. |

## Supporting / Internal Models

| Prisma model | Why it is not first-class |
| --- | --- |
| `User` | Internal support model for Clerk-backed persistence and authorship references. |
| `PostTag` | Join table managed indirectly by the posts and tags admin flows. |
| `CoursePartner` | Join table managed indirectly through course and partner relationships. |

## Domain Alignment

- `Site`: `HomepageSection`, `MenuItem`, `Configuration`
- `Content`: `Post`, `Category`, `Tag`, `Course`, `Page` (`service` template), `ContentSection`, `Review`
- `People`: `Staff`, `StaffType`, `Department`, `Partner`
- `Operations`: `ContactForm`, `Registration`
- `Media`: `Media`

## Known Exceptions

- `HomepageSection` still stores additional keys such as `reviews` and `video`, but the public homepage renderer does not currently render them. The admin homepage editor keeps these visible as stored-but-unused data instead of treating them as active homepage blocks.
- `Page` is only covered as a first-class admin editing experience for service templates in the current realignment. Other `Page` usages remain outside this admin redesign.
