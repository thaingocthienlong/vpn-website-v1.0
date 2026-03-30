# Tooling, Ops, And Monitoring

Developer workflow signals:
- Main commands live in `package.json`.
- `npm run dev`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `npm run start` are the core development/verification loop.
- `scripts/**`, `server.js`, `src/app/admin/**`, and `src/app/api/admin/**` are ignored by ESLint and need manual scrutiny.

Deployment and packaging:
- The app is configured with `output: "standalone"` in `next.config.ts`.
- `server.js` is a custom Phusion Passenger/Plesk entrypoint.
- `scripts/build-standalone.mjs` and the `plesk-*` npm scripts are deployment-oriented helpers.
- Prisma operations in this repo look closer to `db push` plus import/verification helpers than to a rich checked-in migration workflow.

Monitoring:
- Sentry is configured in `next.config.ts`, `instrumentation.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts`.
- Shared env logic is in `src/lib/monitoring/sentry-env.ts`.
- There is a dedicated verification route at `src/app/api/monitoring/sentry-check/route.ts`.

Documentation and operational cautions:
- Do not treat `README.md` as source of truth where it conflicts with current config files.
- Some docs appear historical or stale, including older performance/deployment notes.
- Playwright is installed, but there is no dependable checked-in automated UI test setup in the repo today.
- On this Windows workstation, some deployment scripts are Unix-shell-specific and may need adaptation before use.