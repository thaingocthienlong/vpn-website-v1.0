# Suggested Commands

Primary development commands:
- `npm run dev` — start the Next.js development server.
- `npm run mcp:chrome` — run the Chrome DevTools MCP helper.
- `npm run lint` — run ESLint.
- `npx tsc --noEmit` — manual typecheck; required because build ignores TypeScript errors.
- `npm run build` — production Next.js build.
- `npm run start` — start the production server.
- `npm run build-standalone` — prepare the standalone deployment bundle.

Data and migration helpers:
- `npm run migrate:json:audit`
- `npm run migrate:json:dry-run`
- `npm run migrate:json`
- `npm run verify:db:json`

Important caveats:
- `npm run build` is not a type-safety gate because `next.config.ts` sets `typescript.ignoreBuildErrors = true`.
- There is no reliable checked-in automated test suite today; Playwright is installed but no checked-in Playwright config or test suite is present.
- On Windows, some `plesk-*` scripts are Unix-shell-oriented and may not run cleanly in PowerShell without adjustment.