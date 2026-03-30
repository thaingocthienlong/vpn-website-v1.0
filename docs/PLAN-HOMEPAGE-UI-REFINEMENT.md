# Homepage UI Refinement Plan

## Execution Status

- Canonical repo plan: active
- Repo audit checklist: `docs/AUDIT-HOMEPAGE-HOVER-SCROLL-RESPONSIVE.md`
- Linear tracker: `DRE-14`
- Notion update: blocked previously by auth and not required to unblock code delivery
- Remaining non-UI gaps after this pass:
  - missing legal-policy routes for footer links
  - HTML-entity cleanup still needed in some CMS summaries

## Summary

- Refine the public homepage without changing Prisma schema, APIs, or section ordering.
- Add a public VI/EN language toggle in the header.
- Tighten the homepage interaction states across header, hero, training, services, gallery, contact/register, and footer.
- Keep repo docs and Linear tracking current during execution. Notion remains a blocked follow-up if auth is still unavailable.

## Implementation Scope

### Header

- Add a two-chip `VI / EN` locale toggle in the right utility cluster.
- Use the existing equivalent-route mapping helper and preserve query strings where present.
- Keep the scrolled header styling unchanged except for the new toggle.
- Make the pre-scroll brand block and nav shell transparent/glass.
- Keep the hotline pill readable with dark navy text on a more transparent shell.
- Reduce top-bar spacing and control sizes on mobile/tablet so the toggle and menu button fit cleanly.

### Hero

- Keep the current editorial structure.
- On desktop, preserve the full featured-program rail.
- On tablet and mobile, show only the first featured program card/link and hide the remaining supporting rail items.

### Training

- Keep the current lead/support split.
- Restyle the `View all programs` button hover state to match the scrolled header hotline pill family instead of turning pure white.

### Services

- Keep the current dark section layout.
- Restyle the primary CTA pill with dark navy text by default.
- Swap fill/text emphasis on hover while keeping contrast strong.
- Reuse this CTA style in the contact/register section.

### Gallery

- Remove the homepage lightbox pattern.
- Keep a large active image on the left on desktop.
- Replace the right-side supporting stack with a paginated `2 x 3` thumbnail grid.
- Clicking a thumbnail updates the active large image instead of opening a modal.
- On tablet/mobile, stack the active image above the paginated thumbnail grid.

### Contact / Register

- Move the section background onto the same dark surface family used by the services section.
- Restyle the main contact CTA to match the services CTA pill.
- Keep the form on a pale surface with dark ink text, labels, placeholders, and field values.
- Ensure no white-on-white form text remains.

### Footer

- Remove the dark boxed panel treatment.
- Use a transparent footer surface over a hero-like paper grid background.
- Switch footer copy, icons, and links to dark navy hierarchy.
- Keep the current content structure and information density.

## Verification

- `npm run lint`
- `npx tsc --noEmit`
- Browser verification on `/` and `/en` for:
  - header pre-scroll and scrolled states,
  - mobile header closed/open states,
  - locale toggle behavior,
  - hero tablet/mobile rail reduction,
  - training/services CTA hover states,
  - gallery active-image selection and pagination,
  - contact/register contrast and form states,
  - footer readability on the new paper-grid surface.

## Tracking

- Create/update a Linear issue under `Public CMS Alignment` for this UI refinement pass.
- Add screenshot references and state checks to the audit doc below.
- If Notion auth is still blocked, flag the external documentation update as blocked instead of silently skipping it.
