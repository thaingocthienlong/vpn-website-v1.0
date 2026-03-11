# Performance Fix Implementation Plan

## Problem Identified

The Next.js application is suffering from "extremely slow redirect and loading times" due to an architectural anti-pattern in the Server Components `src/app/page.tsx` and `src/app/[locale]/page.tsx`.

**Root Cause Analysis (`problem-solving-pro` approach):**

1. **Self-Fetching Loop:** The hompage makes 3 absolute HTTP `fetch` requests back to its own API (`/api/posts`, `/api/courses`, `/api/partners`) during Server-Side Rendering.
2. **Middleware Amplification:** Because these are fully qualified HTTP requests, they pass through Next.js's network stack and trigger `src/middleware.ts` 3 extra times.
3. **Clerk Auth Overhead:** `middleware.ts` wraps all requests with `clerkMiddleware()`. This means Clerk runs session validation 3 extra times per page render just for internal data, creating severe blocking and perceived "redirect" delays.

## Purposed Changes

### 1. Create Core Data Services

We will abstract the database queries out of the API routes so they can be securely called from both the API (for client side) and Server Components (for SSR).

#### [NEW] `src/lib/services/homepage.ts`

We will create a service file that holds the Prisma queries for the homepage data:

- `getFeaturedPosts(locale, limit)`
- `getFeaturedCourses(locale, limit)`
- `getActivePartners(locale)`

### 2. Update Server Components to Use Direct Queries

We will remove the `fetch(`${baseUrl}/api/...`)` calls and replace them with direct DB queries.

#### [MODIFY] `src/app/page.tsx`

- Remove the `getHomepageData` fetch wrapper.
- Call the functions from `src/lib/services/homepage.ts` directly.

#### [MODIFY] `src/app/[locale]/page.tsx`

- Remove the HTTP fetch wrapper.
- Call the functions from `src/lib/services/homepage.ts` directly, passing the `locale`.

### 3. Update API Routes (Optional Polish)

- Refactor `/api/posts/route.ts`, `/api/courses/route.ts`, and `/api/partners/route.ts` to use the shared query logic if necessary, ensuring DRY code. (This step can be done later if we want to isolate the fix to just the SSR performance).

## Verification Plan

1. Restart the dev server (`npm run dev`).
2. Load the homepage and measure Time to First Byte (TTFB).
3. Verify that the terminal no longer shows internal `GET /api/...` calls during the initial SSR render.
4. Verify that the locale and data hydration still work properly.
