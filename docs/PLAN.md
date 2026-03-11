# Performance Diagnosis & Orchestration Plan

## 1. Problem Definition (Diagnostic)

**Problem:** The application experiences extremely slow overall loading times and high redirect times.
**Goal:** Identify root drivers for these bottlenecks (specifically the redirect loop/delays and TTFB) and recommend/implement robust fixes.

## 2. Process Flow Decomposition (MECE)

To systematically diagnose the slow loading and redirects, we break down the Next.js request lifecycle:

- **Branch A: Routing & Middleware (Prioritized due to "high redirect time")**
  - Next.js `middleware.ts` execution (Auth checks, i18n locale redirects).
  - High risk: Database calls or complex synchronous logic blocking the middleware.
- **Branch B: Server Processing & Data Fetching (Prioritized due to "slow loading")**
  - Server Components (`page.tsx`, `layout.tsx`) data dependencies.
  - High risk: Waterfall requests, missing caching, unoptimized ORM queries.
- **Branch C: Client Rendering & Asset Delivery**
  - Hydration, heavy client-side JavaScript (`"use client"` abuse).
  - High risk: Large bundle sizes, unoptimized images blocking LCP.

## 3. Prioritization & Day 1 Hypotheses

Based on the symptoms, we will apply the *80/20 rule* to focus on **Branch A** and **Branch B**.

**Day 1 Hypotheses:**

1. The `middleware.ts` (or i18n routing layer) is performing blocking operations (e.g., checking session in the DB on every request), causing the high redirect times.
2. The main landing page is executing sequential (waterfall) data fetches instead of parallel fetching, causing slow Initial Server Response.

## 4. Multi-Agent Orchestration (Phase 2)

Upon your approval of this plan, we will orchestrate the following agents in parallel to test our hypotheses and implement fixes:

1. **`performance-optimizer`**:
   - Analyze middleware execution time.
   - Profile the request lifecycle and bundle constraints.
2. **`backend-specialist`**:
   - Deep dive into `middleware.ts`, `i18n` configurations, and routing logic.
   - Inspect Server Component data fetching (Prisma/fetch caching).
3. **`test-engineer`**:
   - Run verification scripts on the proposed fixes.
   - Ensure the application still functions correctly without breaking auth or routing.

## 5. Communication & Next Steps

We will synthesize the findings from all agents and present a clear "Answer First" recommendation (Pyramid Principle), focusing on the highest impact changes to resolve the redirect and loading delays.

---
**Approval Checkpoint:**
Does this diagnostic plan and agent orchestration strategy look good to you? Once approved, I will deploy the 3 agents in parallel to execute the analysis and implement the optimizations.
