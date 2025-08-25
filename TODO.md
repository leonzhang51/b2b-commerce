- [ ] Integrate real product image upload logic in `ProductManager.tsx` (replace demo URL logic with actual backend upload, e.g., Supabase Storage or S3)
- [ ] Integrate real product image upload logic in `ProductManager.tsx` (replace demo URL logic with actual backend upload, e.g., Supabase Storage or S3)
  - Note: client-side image compression is implemented in `src/utils/imageUtils.ts` (`compressImageFileAsync`). `src/components/ProductManager.tsx` currently creates a demo local URL after compression — replace that block with actual upload + URL persistence.

# Project TODO

## ✅ Features status (auto-checked from codebase)

- Category and product schema with UUIDs and referential integrity — DONE (see `sql/setup-categories.sql`, `sql/setup-categories-safe.sql`)
- Product grid and search components — DONE (`src/components/ProductGrid.tsx`, `src/components/ProductSearch.tsx`)
- Zustand for local state management — DONE (`src/store/cartStore.ts`, `src/store/index.ts`)
- TanStack Query for data fetching — DONE (`src/hooks/useSupabase.ts`, multiple `useQuery` hooks)
- Cart functionality (add/remove, quantity) with persistence — DONE (`src/store/cartStore.ts` with `persist` middleware)
- Checkout flow (UI present) — PARTIAL (checkout buttons/UI exist, but no server-side order creation endpoints found)
- Admin UI for product/category management — DONE (`src/components/CategoryManager.tsx`, `src/components/AdminDashboard.tsx`)
- User authentication and authorization — DONE (Supabase auth integration and related stores/hooks in `src/store/securityStore.ts`)
- Product search and filtering — DONE (`src/components/ProductFacetedFilters.tsx`, search hooks)
- Role-based pricing and discount logic — DONE (`src/lib/rolePricing.ts`, `src/lib/discountCodes.ts`)
- Order management (view orders, order history) — PARTIAL (UI/clients hooks may exist; no server-side `orders` insert/query endpoints found in services)
- API endpoints for cart and orders — PARTIAL (cart is client-side; no server order creation endpoints located)
- Supabase integration for data — DONE (multiple `supabase` imports; `src/lib/supabase.ts`)
- TanStack Router setup with codegen — DONE (`src/routes/*`, `src/routes/__root.tsx`)
- Automated changelog and versioning (standard-version + Husky) — CONFIGURED (mentioned in repo metadata and `.github/copilot-instructions.md`)
- Testing tooling (Vitest + tests) — DONE (`vitest.config.ts`, many tests in `src/__tests__`)
- Security and TypeScript guidelines — DONE (project docs and types present)

Implemented/Notable refactor artifacts

- Client-side image utilities: `src/utils/imageUtils.ts` (compression, srcset, placeholder helpers)
- ProductManager: `src/components/ProductManager.tsx` — import/export, CSV/JSON parsing, image upload currently demo-only
- Cart store: `src/store/cartStore.ts` — persistent cart, role-based pricing integration, discount code handling, computed discounted totals

## 🟡 Feature Breakdown & Status

### User Authentication & Roles

- [x] Implement registration, login, and logout UI (sign up, sign in, sign out)
- [x] Integrate Supabase Auth for user management
- [x] Add password reset flow (email confirmation uses Supabase default; custom UI optional)
- [x] Store additional user profile fields (name, company, phone, etc.) in `public.users`
- [x] Sync Supabase `auth.users` with `public.users` (SQL + app fetch logic)
- [x] Implement role assignment (`role` + `permissions`) in `public.users`
- [x] Add role-based route protection (`RequireRole` component)
- [x] Add admin UI for managing users and roles
- [x] Enforce Row Level Security (RLS) in Supabase for data access by role
- [ ] Expand automated tests for full auth & authorization flows
  - [x] RequireRole access tests
  - [x] Basic form render tests (login, register, reset password)
  - [x] Registration submission success & error handling
  - [x] Password reset success path assertion
  - [x] Admin role change & permission regression test
  - [x] Negative access tests (non-admin hitting admin route)

### Cart & Pricing (Active)

- [x] Persistent cart (localStorage or Supabase sync)
- [x] Role-based pricing tiers (e.g., admin, manager, buyer)
- [x] Discount code support
- [x] Cart UI/UX polish (minicart, sidebar, badge)
- [x] Cart tests (add/remove, quantity, clear, checkout)

Note: The cart implementation has been refactored into `src/store/cartStore.ts` and includes persistence via `zustand/middleware` persist, role-pricing via `src/lib/rolePricing`, and discount code helpers in `src/lib/discountCodes`.

Note: The cart implementation has been refactored into `src/store/cartStore.ts` and includes persistence via `zustand/middleware` persist, role-pricing via `src/lib/rolePricing`, and discount code helpers in `src/lib/discountCodes`.

### Recently Completed ✅

- [x] **Search & filtering** (full-text search, faceted filters, debounced suggestions)
  - Full-text search across product name, description, SKU, tags
  - Faceted filters (price range, stock status, categories, brands)
  - Debounced search input with autocomplete dropdown
  - Search suggestions and recent searches
  - Advanced search filters and saved searches

- [x] **Admin improvements** (audit log, user impersonation, soft delete/restore)
  - Comprehensive audit log for all admin actions
  - User impersonation for support/testing (with security controls)
  - Soft delete/restore for users and other entities
  - Enhanced admin dashboard with better navigation
  - Bulk operations for user management

### Upcoming (Select Next Focus)

Pick next initiative (move chosen items into active list):

- Security hardening (refresh token rotation, session timeout UI, email verification banner)
- Replace demo image upload in `ProductManager.tsx` with backend storage (Supabase Storage or S3) and persist image URLs in product records

# TODO / Roadmap

This file summarizes what is implemented in the codebase today and gives a focused, prioritized roadmap for the next steps. Keep it short and actionable — update as you complete items.

## Current implementation snapshot (verified)

- Frontend
  - Product grid, search, filtering, and faceted filters (`src/components/*`, `src/hooks/*`) — working
  - Cart: persistent Zustand store with role-aware pricing and discounts (`src/store/cartStore.ts`) — working and tested
  - Checkout UI and flows (client-side) — present
  - Admin UI: category/product management, audit log, impersonation, soft-delete — present
  - Auth UI and flows (login/register/reset) using Supabase Auth — present and tested
- Backend / DB artifacts
  - Orders schema and RPC
    - `sql/setup-orders.sql` — creates `orders` and `order_items`
    - `sql/rpc-create-order.sql` — RPC `create_order(...)` (supports p_idempotency_key in newer version)
    - `sql/migrate-add-idempotency-key.sql` — migration adding `idempotency_key` and partial unique index
  - Use-cases & repositories
    - `src/usecases/CheckoutUseCase.ts` — orchestrates checkout, input validation, idempotency check
    - `src/models/ordersRepository.ts` — RPC caller + convenience methods (findByIdempotencyKey, recordIdempotencyKey)
    - `src/models/productsRepository.ts` — product data access helpers
  - CI & migrations
    - `scripts/apply-sql.sh` helper and `package.json` `migrate:ci` script
    - GitHub Actions workflow `.github/workflows/test-and-migrate.yml` to apply migrations + run tests
- Tests & quality
  - Vitest setup and many unit tests in `src/__tests__` — full suite passes locally
  - ESLint/Prettier configuration present; repo-level docs updated for MVP patterns

## What is fully done (no work required right now)

- Product search + filters
- Cart store and pricing logic (including tests)
- Checkout use-case wired to call DB RPC via `ordersRepository` (including idempotency handling)
- Orders DB artifacts and migration scripts exist
- CI workflow to apply migrations and run tests (linter note: we removed direct `${{ secrets.* }}` usage to satisfy local validator)

## Short-term priorities (next 1–2 weeks)

These are small, high-impact items that move the app toward an MVP for B2B purchasing.

1. Wire frontend checkout to the server RPC and add integration tests — HIGH
   - Confirm client calls `src/routes/api.create-order.ts` which uses `CheckoutUseCase` (it exists); add integration test that runs against local Postgres used in CI or a test DB mock.
   - Verify the RPC `create_order` behavior with idempotency key in staging.
   - Acceptance: checkout call creates `orders` and `order_items` rows and returns order summary.

2. Apply idempotency migration to staging and confirm DB-level atomic behavior — HIGH
   - Run `scripts/apply-sql.sh sql/migrate-add-idempotency-key.sql` against staging DB.
   - Run concurrency test to ensure duplicate requests with same idempotency key do not create duplicate orders.
   - After verification, consider removing app-level fallback `recordIdempotencyKey` if DB-level guarantees are sufficient.

3. Implement real product image upload in `src/components/ProductManager.tsx` — MEDIUM
   - Use `src/utils/imageUtils.ts` to compress images then upload to Supabase Storage or S3.
   - Persist the returned URL on the product record and update UI to use stored URLs.

4. Shopping-list spike (heuristic) — MEDIUM
   - Add `src/hooks/useShoppingList.ts` that generates candidate lists from order history and role templates.
   - Add `src/components/ShoppingListModal.tsx` to preview and bulk-add items to cart.
   - Acceptance: user can open modal, edit quantities, and bulk-add to cart.

## Medium-term priorities (2–6 weeks)

- AI / MCP POC: local reranker under `src/mcp/` and hook `useEnhancedSearch.ts` — start rules-based, then add LLM reranker if promising
- Automation webhook & n8n POC: `src/routes/api/webhooks/*` and an example workflow to transform shopping-list acceptance into a draft purchase order and notification
- Add E2E smoke tests for critical flows (login → search → add-to-cart → checkout)

## Low-risk housekeeping & improvements

- Add unit tests for `compressImageFileAsync` (mock canvas) and edge cases for cart discount logic
- Accessibility pass for header, modals, and forms
- Perf: lazy-load heavy components (ProductDetails variants, admin bulk tools)
- Docs: update README with migration instructions and how to run CI locally (include `scripts/apply-sql.sh` usage)

## Deployment / migration checklist (operational)

- Run `./scripts/apply-sql.sh sql/setup-orders.sql` then `./scripts/apply-sql.sh sql/migrate-add-idempotency-key.sql` then `./scripts/apply-sql.sh sql/rpc-create-order.sql` in staging before enabling DB-level idempotency in production
- Ensure repository Actions Variables or Secrets supply `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` for CI or set test defaults in `vitest.setup.ts`

## Quick decisions to make (pick one to unblock work)

- A: Apply idempotency migration to staging now (I can prepare a runbook and migration PR) — recommended before enabling DB-level idempotency
- B: Start Shopping-list heuristic spike (UI + bulk-add) — quick visible value for B2B users
- C: Implement real image upload for ProductManager — needed for admin UX

---

Update this file as you complete items or if priorities change.
