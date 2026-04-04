# UI Regression Tracking Guide

## Purpose

Use this guide whenever a public- or admin-facing UI bug, responsive regression, layout mismatch, or interaction issue is discovered in this repo.

The goal is to make every investigation easy to trace later, even when the issue never appeared in Sentry.

## Tracking Rules

1. Create or update a Linear issue for every UI regression.
2. Apply the `UI Regression` label in Linear whenever the issue is specifically about layout, responsiveness, visual breakage, interaction regressions, or browser/runtime rendering mismatches.
3. Add a Notion execution-log update when the fix spans multiple iterations, design decisions, or debugging passes.
4. Use Sentry only when there is an actual runtime or production issue with telemetry, events, or a real Sentry issue to reference.
5. Do not skip tracking just because the bug is local, browser-specific, or not reproducible in Sentry.

## Minimum Linear Issue Content

Each UI regression issue should capture:

- route or page affected
- viewport or device where it was observed
- expected behavior
- actual behavior
- whether it reproduces on localhost, LAN, or both
- screenshots or evidence paths when available
- verification commands run after the fix

## When To Update Notion

Append a Notion execution note when:

- the issue required more than one implementation pass
- the fix changed design decisions, not just code
- the debugging process uncovered a reusable workflow lesson
- multiple MCP systems were involved in the investigation

## When To Use Sentry

Use Sentry as supporting evidence only when one of these is true:

- there is an actual frontend/runtime exception
- there is a production-visible issue with a real Sentry event or issue
- a release regression can be tied to Sentry telemetry

If none of those are true, track the work in Linear and optionally Notion instead of inventing a Sentry artifact.

## Recommended Workflow

1. Reproduce locally and capture browser evidence with Chrome DevTools MCP or Playwright.
2. Create or update the Linear issue immediately.
3. Add the `UI Regression` label.
4. Implement the smallest fix that resolves the problem.
5. Verify with `npm run lint`, `npx tsc --noEmit`, and browser/runtime checks.
6. Sync the final result back to Linear.
7. Add a Notion follow-up note if the issue was iterative or decision-heavy.

## Current Standard

- Linear is the canonical tracker for UI regressions.
- Notion is the decision and execution log when extra context is useful.
- Sentry is optional evidence, not the default source of truth for UI bugs.
