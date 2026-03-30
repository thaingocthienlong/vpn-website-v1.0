# Task Completion Checklist

Before claiming work is complete:
- Run `npm run lint`.
- Run `npx tsc --noEmit`.
- Run the relevant runtime verification for changed routes, handlers, or services.
- For public UI work, use browser MCP tooling (Playwright or Chrome DevTools) when possible to verify the actual rendered behavior.
- If the task touched admin routes, admin API handlers, `server.js`, or `scripts/**`, do extra manual review because ESLint ignores those paths.

Repository-specific reminders:
- Do not rely on `npm run build` alone; build ignores TypeScript errors in this repo.
- There is no dependable checked-in automated test suite, so verification is usually lint + manual typecheck + targeted runtime/browser checks.
- Prefer current config files over README when repo docs conflict.
- Do not expose `.env` contents or assume deployment/database behavior from stale docs.