> Respond entirely in English.

## Mandatory MCP Workflow

- Start with MCP resources and templates exposed by configured servers before falling back to manual context gathering.
- In this environment, the configured MCP servers are `linear`, `notion`, `playwright`, `figma`, `context7`, `chrome-devtools`, `sentry`, `neural-memory`, and `serena`.
- Use `context7` for framework and library documentation.
- Use `playwright` or `chrome-devtools` for browser inspection, screenshots, console and network review, and UI verification.
- Use `sentry` for production errors, releases, and event diagnostics.
- Use `notion` and `linear` when the task includes documentation, planning, or task tracking.
- Use `figma` only for design inspection or design-to-code work.
- Use `neural-memory` only for memory and context workflows, not as a replacement for repo inspection.
- Use `serena` as the primary workspace-aware repo inspection tool for symbol search, file discovery, and code navigation.
- Fall back to local search and read commands only when Serena or other MCP options cannot answer the repo question cleanly.
- Before relying on external library behavior, check `context7` or the official documentation source that matches the dependency.
- On Windows, prefer non-mutating inspection first. The current shell is PowerShell; use `cmd /c` only when a command specifically needs `cmd` semantics or `.bat` execution.

## MCP Server Usage Policy

- Prefer configured MCP tools over generic web search or shell commands when they can answer the task directly.
- Use MCP resources and templates when available instead of recreating the same context by hand.
- Combine `context7` plus `serena` for Next.js, Prisma, Clerk, Sentry, Tailwind, or `next-intl` work.
- Combine `playwright` or `chrome-devtools` plus `serena` for public UI changes and route verification.
- Combine `sentry` plus `serena` for monitoring, instrumentation, or production bug work.
- Use `notion` or `linear` only when the task needs durable planning, notes, or issue updates.
- Do not document or require MCP servers that are not actually configured in the current environment.

## Installed Codex Plugin

- A home-local Codex plugin, `everything-claude-code`, is installed at `~/plugins/everything-claude-code` and enabled through `~/.codex/config.toml`.
- Treat the plugin as an additional source of Codex skills and MCP definitions, not as a replacement for the repo-specific rules in this file.
- Prefer the plugin's workflow skills when they clearly fit the task, especially for TDD, security review, verification, repo scanning, documentation lookup, E2E testing, and framework-specific implementation work.
- Do not assume every MCP server declared by the plugin is active in the current session. Verify active servers from the current Codex config or runtime before documenting them in task output.
- When plugin guidance conflicts with this repo's instructions, follow this `AGENTS.md` file and the currently configured environment.

## Delivery Lifecycle

### Analyze

- Inspect `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `prisma/schema.prisma`, and representative source files before making repo claims.
- Use `context7` for dependency behavior and browser MCP tools for runtime or UI evidence.

### Plan

- Build the plan from repo evidence first, then call out missing signals explicitly instead of guessing.
- Keep implementation notes grounded in the actual app shape: Next.js App Router, Prisma with libsql adapter, optional Clerk auth, `next-intl`, and Sentry instrumentation.

### Document

- Put repo notes, audits, and planning artifacts in `docs/` or `reports/`.
- Use `notion` only when the task needs durable external documentation.

### Divide Tasks

- Break large work into small, verifiable units by subsystem such as public routes, admin routes, Prisma data access, scripts, or monitoring.
- Use `linear` only when issue tracking or status updates are part of the request.

### Implement

- Change the smallest surface that solves the problem.
- Keep data access centralized in `src/lib/` or service modules rather than scattering Prisma logic across route and UI files.

### Track

- Record what changed, what was verified, and what remains open in the task response.
- If the task includes external tracking, update `linear` or `notion` instead of creating ad hoc root files.

### Test And Verify

- Run the relevant commands explicitly; do not assume `npm run build` is enough.
- For UI work, verify with `playwright` or `chrome-devtools` against a local runtime when possible.

### Update Tasks And Documents

- Reflect completed work in `docs/`, `reports/`, `notion`, or `linear` only when the task asks for it.
- Do not create a `plans/` folder; there is no root `plans/` directory in this repo.

### Final Report

- Summarize what changed, what was verified, and any remaining risk or missing repo signals.
- Cite the files or commands that support non-obvious claims.

## Project Structure

- `src/app/`: Next.js App Router entrypoints, public Vietnamese routes, localized routes under `[locale]`, `admin/` pages, API route handlers, `sitemap.ts`, and `robots.ts`.
- `src/components/`: Shared UI and page components, including `ui/`, `layout/`, `sections/`, `cards/`, `news/`, `course/`, `effects/`, `lightswind/`, `motion/`, `route-shell/`, `providers/`, and `skeletons/`.
- `src/hooks/`: Custom hooks such as `use-debounce.ts`, `use-mobile.tsx`, and `use-toast.tsx`.
- `src/i18n/`: `next-intl` config, routing, request, and navigation helpers.
- `src/lib/`: Prisma access, auth helpers, monitoring helpers, content/services logic, API helpers, Cloudinary and email helpers, and shared utilities.
- `src/types/`: Shared TypeScript types.
- `prisma/`: Prisma schema, migrations, and database configuration inputs.
- `scripts/`: Standalone packaging, migration, verification, import/export, and Chrome MCP helper scripts.
- `migrate/`: JSON migration pipeline and source datasets.
- `messages/`: Locale message files.
- `public/`: Static assets, including local fonts consumed by `src/app/layout.tsx`.
- `docs/`, `reports/`, `design-system/`: Planning, audit, report, and design guidance artifacts.
- Root runtime and integration files include `next.config.ts`, `server.js`, `prisma.config.ts`, `instrumentation.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts`.
- Generated or local artifacts include `.next/`, `next-env.d.ts`, `tsconfig.tsbuildinfo`, `scripts/tsconfig.tsbuildinfo`, log files, and many root-level screenshot captures.

## Code Conventions

- Use TypeScript-first changes and keep them compatible with `strict: true` in `tsconfig.json`.
- Use the `@/*` import alias for code under `src/`.
- Keep Next.js App Router file conventions such as `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and `route.ts`.
- Use PascalCase for React components and exported types.
- Keep hooks in the `use-*.ts` or `use-*.tsx` pattern.
- Use kebab-case for helper, service, validator, and utility filenames.
- Match the existing style: double quotes, semicolons, typed interfaces for shared contracts, and Tailwind utility classes inline with the surrounding file style.
- Tailwind CSS v4 is loaded via `@import "tailwindcss"` in `src/app/globals.css`, and the `lightswind` plugin is in use.
- Preserve the custom font setup and CSS token system in `src/app/layout.tsx` and `src/app/globals.css` unless the task is specifically about redesigning them.
- Keep Prisma access centralized in `src/lib/prisma.ts` and service modules.
- `allowJs` is enabled, and some mixed JS or generated declaration files exist alongside TS modules; do not remove them casually.

## Important Rules And Guides

- Do not manually edit `next-env.d.ts`; it is generated by Next.js.
- Treat `.env` and `.env.local` as secrets. Do not expose or rewrite their contents unless the user explicitly asks.
- Do not rely on `npm run build` as the only quality gate. `next.config.ts` sets `typescript.ignoreBuildErrors = true`, so run `npm run lint` and `npx tsc --noEmit` explicitly.
- `eslint.config.mjs` ignores `scripts/**`, `server.js`, `src/app/admin/**`, and `src/app/api/admin/**`; changes in those paths need extra manual review.
- This is not a static export or plain static-site repo. Preview and verify through the Next.js runtime with `npm run dev` or `npm run build` plus `npm run start`.
- Prisma is configured with a `sqlite` schema and a libsql adapter in `src/lib/prisma.ts`. Do not assume a Postgres-only workflow unless the task introduces it explicitly.
- Many root-level PNG and WebP screenshots, `.log` files, `.next/` outputs, and `*.tsbuildinfo` files are generated or local verification artifacts. Do not edit or commit them unless the task is specifically about those artifacts.
- `README.md` contains some stale project signals. When repo docs disagree, treat `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, and `prisma/schema.prisma` as the source of truth.
- Keep new planning or audit files in `docs/` or `reports/`; there is no root `plans/` directory in this repo.
- Ask before destructive actions such as deleting files, dropping tables, wiping data, or changing deployment state.

## Build And Verification Commands

- Install dependencies: `npm install`
- Run the development server: `npm run dev`
- Run the Chrome DevTools MCP helper: `npm run mcp:chrome`
- Lint: `npm run lint`
- Manual typecheck: `npx tsc --noEmit`
- Build the production app: `npm run build`
- Start the production app: `npm run start`
- Standalone packaging helper: `npm run build-standalone`
- Plesk build flow: `npm run plesk-build`
- Plesk database push: `npm run plesk-db-push`
- Plesk Prisma generate: `npm run plesk-standalone-prisma`
- JSON migration audit: `npm run migrate:json:audit`
- JSON migration dry run: `npm run migrate:json:dry-run`
- JSON migration execute: `npm run migrate:json`
- Database verification helper: `npm run verify:db:json`
- Current test status: there is no `npm test` script in `package.json`.
- Current test status: no Jest, Vitest, or Cypress config was found.
- Current test status: `playwright` is installed, but no `playwright.config.*` file or checked-in test files were found.

## Core Rules

- Be truthful and prefer repo evidence over assumptions.
- Prefer configured MCP and domain-specific tools before shell fallbacks.
- Verify commands, directories, and integrations against the repo before documenting them.
- Ask before destructive changes, deployment actions, or database-affecting operations.
- Do not invent missing frameworks, tests, scripts, directories, or workflows.
