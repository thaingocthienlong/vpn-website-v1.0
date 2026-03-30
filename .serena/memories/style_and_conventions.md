# Style And Conventions

Core conventions:
- TypeScript-first changes.
- `strict: true` is enabled in `tsconfig.json`.
- Use the `@/*` alias for imports under `src/`.
- Match existing style: double quotes and semicolons.
- Use PascalCase for React components and exported types.
- Use `use-*.ts` or `use-*.tsx` naming for hooks.
- Use kebab-case for helpers, services, validators, and utility filenames.
- Keep Next App Router file conventions such as `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and `route.ts`.

Project-specific guidance:
- Keep Prisma access centralized in `src/lib/prisma.ts` and service modules instead of scattering database logic across routes and components.
- Tailwind v4 is loaded from `src/app/globals.css`; the project also uses Lightswind, but much of the styling system is custom CSS variables and bespoke utility classes.
- Preserve the custom font and token system in `src/app/layout.tsx` and `src/app/globals.css` unless the task is specifically about redesigning them.

Cautions:
- `allowJs` is enabled, so mixed JS/TS files exist and should not be removed casually.
- `next-env.d.ts` is generated and should not be edited manually.
- Treat `.env` and `.env.local` as secrets.