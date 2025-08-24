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
- Add integration tests for bulk import and image upload paths
- Implement server-side order endpoints (create order, order items) or wire existing backend to client checkout flow
- Admin dashboard improvements (UX polish, bulk edit flows)

## � MVP / POC priorities (high priority — add to roadmap)

These are critical for the project's purpose as an MVP/POC. Add them to `feat/cart` work and create small spikes (1–2 day) to validate feasibility.

1. Shopping-list UX for business users (generate & one-click add-to-cart)
   - Why: business users purchase repeated sets of products; reduce search + add friction by showing a suggested shopping list at sign-in and during search.
   - Contract (tiny):
     - Input: authenticated user id, user role, order history, company profile, saved lists
     - Output: ordered list of product identifiers with suggested quantities and a confidence score
     - Success: modal shows list; user can verify, edit quantities, add selected items to cart in one action
   - Edge cases: new users (no history), conflicting role pricing, out-of-stock items, partial availability
   - Suggested files/components to add:
     - `src/hooks/useShoppingList.ts` — server/client hook to assemble shopping list (calls MCP/AI or local heuristics)
     - `src/components/ShoppingListModal.tsx` — modal UI to preview/confirm list
     - integrate with `src/store/cartStore.ts` (bulk add API)
     - trigger on sign-in in `src/routes/__root.tsx` or `src/components/Header.tsx`
   - Minimal implementation plan: start with heuristic generator (order history + role-based templates), then evolve to AI-driven suggestions.

2. AI-enhanced search via MCP (Model Context Protocol) + LLM
   - Why: make search results context-aware (role, company, past orders) and reduce irrelevant results for technical/business roles.
   - High-level design:
     - Lightweight MCP server (POC) sits as a middleware: `src/mcp/server.ts` (or separate microservice) that queries Supabase for product and user context, formats a compressed context window and calls an LLM agent.
     - Client search flow: `src/hooks/useEnhancedSearch.ts` calls MCP endpoint which returns ranked product IDs and rationale.
   - Contract:
     - Input: user id, role, search query, optionally recent order IDs or category filters
     - Output: ranked list of product IDs with scores and optional explainability text
   - Privacy & cost notes: avoid sending raw PII to the LLM; compress/aggregate product context (embeddings) and limit token usage. Cache popular queries.
   - Suggested files/helpers:
     - `src/mcp/` — MCP server/client scaffolding
     - `src/lib/aiAgent.ts` — small wrapper to call chosen LLM (openai/azure/vertex) with guardrails
     - `src/hooks/useEnhancedSearch.ts` — consumes MCP search results and maps to products
   - Minimal implementation plan: start with a rules-based reranker locally, then add LLM reranking for a small subset of queries.

3. AI workflow automation for purchasing (n8n / workflow orchestration)
   - Why: automate repetitive workflows (create purchase order, notify approver, re-order recurring items). Useful as POC for automation value.
   - Integration idea:
     - Create simple webhook endpoints `src/integrations/workflows/*` that emit events (shopping-list-accepted, checkout-completed).
     - Connect to n8n or similar to implement flows: send vendor email, generate PDF PO, or escalate approvals.
   - Suggested files:
     - `src/integrations/n8n/README.md` — docs + sample webhooks
     - `src/routes/api/webhooks/workflow.ts` — lightweight webhook receiver (signed) for POC
   - Minimal implementation plan: implement one flow (shopping-list -> create PO draft in DB + email) and demo with n8n.

Quick next steps (spikes)

- Add `src/hooks/useShoppingList.ts` with heuristic fallback (order history + role templates) and wire `ShoppingListModal.tsx` for sign-in trigger
- Prototype MCP server scaffold under `src/mcp/` that can accept query + user context and return ranked IDs (start with local reranker)
- Add webhook endpoint + n8n flow to demonstrate automation for one event

Notes

- These features are explicitly POC-level: prefer isolated, small, well-documented spikes and toggles (feature flags) to avoid coupling with main checkout code.
- I can implement the heuristic shopping-list spike and modal now, then iterate to MCP integration. Tell me which spike to start.

## �📋 Remaining General Backlog

- Responsive/mobile UI improvements
- Testing & quality (MSW API mocking, broader mutation tests, E2E smoke flow)
- Performance (query cache audit, bundle splitting, error boundaries & logging)
- Deployment readiness (env schema validation, health/status route, Supabase migration automation)
- E2E tests for critical user flows
- Performance optimizations (lazy loading, bundle analysis)
- Accessibility audit and improvements
- Documentation for deployment and environment setup
- Optimize database: replace generic product/category names with realistic, diverse names for better search testing

Small next steps (low risk):

- Implement real upload in `src/components/ProductManager.tsx` using `src/utils/imageUtils.ts` to compress prior to upload
- Add unit tests for `compressImageFileAsync` (mock canvas) and cart discount flows
- Update README/DEV docs with branch notes (current branch: `feat/cart`) if appropriate

---

Update this file as features are completed or added.
