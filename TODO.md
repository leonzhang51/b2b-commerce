## 🚩 POC MVP Tasks: B2B AI-Driven Commerce

1. **Shopping List Generation (B2B UX)**

- Auto-generate shopping lists for signed-in users based on order history, role, and project profile.

## POC: B2B AI-driven Commerce — Done vs To Do

This document summarizes what in the repository is already implemented and what remains to support the POC goals:

- POC goals
  1. New B2B UX: auto-generate shopping lists from user order history + profile (role, project, etc.)
  2. Profile-aware search: surface and rerank results to match user profile and history
  3. AI-driven architecture: adopt MCP for DB access and use LLMs for search, reranking, and shopping-list generation

---

## What is Done (short, referenceable)

- Authentication & roles: login/register/reset, Supabase auth integration, role fields in `public.users`, `RequireRole` component. (See: `src/hooks/useAuth.ts`, `src/store/securityStore.ts`, `src/components/RequireAuth.tsx`)
- Product UI: product grid, product search input, faceted filters, product details. (See: `src/components/ProductGrid.tsx`, `src/components/ProductSearch.tsx`, `src/components/ProductFacetedFilters.tsx`)
- Cart & pricing: persistent cart (`src/store/cartStore.ts`) with role-based pricing and discount logic (`src/lib/rolePricing.ts`, `src/lib/discountCodes.ts`). Tests present in `src/__tests__/cartStore.*`.
- Checkout use-case & DB RPC: `src/usecases/CheckoutUseCase.ts`, `src/models/ordersRepository.ts`, SQL artifacts `sql/setup-orders.sql`, `sql/rpc-create-order.sql`, and idempotency migration script `sql/migrate-add-idempotency-key.sql` (migration not necessarily applied to staging).
- Utilities & infra: Supabase client (`src/lib/supabase.ts`), image compression (demo) in `src/utils/imageUtils.ts`, many unit tests (Vitest) and CI workflow.

Summary: the application is a working e-commerce app with auth, search, cart, checkout orchestration, and admin UX. Key pieces for the POC are present but not fully wired to AI/MCP features.

---

## POC To Do (explicit tasks mapped to goals)

Short-term (high priority, next 1–2 weeks)

1. Wire frontend checkout to server RPC — WIRED (integration tests pending)

- Files: `src/routes/api.create-order.ts`, `src/usecases/CheckoutUseCase.ts`, `src/models/ordersRepository.ts`, `src/hooks/useCheckout.ts`
- Status: Frontend is already calling `/api/create-order` (see `src/hooks/useCheckout.ts`), the route handler exists (`src/routes/api.create-order.ts`), `CheckoutUseCase` orchestrates order creation and `ordersRepository` calls the DB RPC `create_order`.
- Note: current tests exercise the route with mocks (unit tests). An integration test that runs against a real Postgres/staging DB to assert rows in `orders` and `order_items` are created is still required.
- Next action: add an integration test (or CI job) that applies migrations, runs the create-order flow, and asserts DB rows; then apply idempotency migration to staging and validate concurrency behavior.

2. Apply idempotency DB migration — DONE (applied in Supabase)

- Files: `sql/migrate-add-idempotency-key.sql`, `scripts/apply-sql.sh`
- Status: migration applied in Supabase (confirmed). The `idempotency_key` column and a partial unique index are present on `orders`.
- Note: application-level fallback `recordIdempotencyKey` can be retained for cross-db compatibility, but DB-level uniqueness now prevents duplicates when `idempotency_key` is provided.
- Optional next step: run a staged concurrency test to validate behavior under load; current manual check in Supabase admin shows schema and index applied.

3. Shopping-list spike & UI (B2B UX) — COMPLETED ✅

- New files: `src/hooks/useShoppingList.ts`, `src/components/ShoppingListModal.tsx`
- Implementation: generate candidate items from `orders` history + role templates; show editable modal allowing bulk-add to cart.
- Status: COMPLETED - Smart shopping list functionality implemented with:
  - Heuristic generator based on order history and frequency
  - Modal UI with quantity editing and bulk-add to cart
  - Integration with Header component (Smart List button)
  - Comprehensive unit tests for hook and modal component
- Acceptance: ✅ signed-in user sees suggested list, can edit quantities, and bulk-adds items to cart.

4. Real product image uploads (admin UX) — COMPLETED ✅

- Files: `src/components/ProductManager.tsx`, `src/utils/imageUtils.ts`
- Implementation: compress image, upload to Supabase Storage, persist URL on product record.
- Status: COMPLETED - Real image upload functionality implemented with:
  - Integration with Supabase Storage for persistent image hosting
  - Image compression before upload (800x800, 80% quality)
  - Product selection dropdown for targeted image updates
  - Improved UI with status indicators and preview
  - Automatic product record updates with new image URLs

Medium-term (2–6 weeks)

5. Profile-driven search & reranking (rules-based → LLM reranker)

- New area: `src/mcp/` for MCP adapters; new hook `src/hooks/useEnhancedSearch.ts`
- Start with heuristics: boost products by user's role, frequently ordered items, and project tags.
- Then add LLM reranker service: `src/services/llmReranker.ts` that accepts query + user context and returns ranked IDs.
- Acceptance: search results ranked higher for historically relevant products for a user.

6. MCP integration for DB access

- Add a lightweight MCP adapter that standardizes DB access paths and isolates LLM-callable data adapters under `src/mcp/`.

7. LLM integration for shopping-list generation & suggestions

- Service: `src/services/llmService.ts` and higher-level `src/services/recommendationService.ts` that combine DB signals + LLM prompts.

Lower priority / housekeeping

- Add E2E smoke tests (login → search → add-to-cart → checkout)
- Accessibility pass and perf lazy-loading
- Add unit tests for `compressImageFileAsync` and expand cart tests

---

## Acceptance Criteria & Next Steps (concrete)

- Implement the shopping-list spike (heuristic) and demo it with test user data. Timebox: 3 days.
- Add a small reranker function (rule-based) integrated into search results; show before/after metrics (CTR or manual check). Timebox: 4 days.
- Create a minimal MCP adapter that exposes product and order read methods used by LLM prompt generation. Timebox: 3 days.

✅ COMPLETED TASKS:

1. ✅ Created `src/hooks/useShoppingList.ts` (heuristic generator) + `src/components/ShoppingListModal.tsx` (full UI) and comprehensive unit tests.
   - Smart shopping list analyzes order history and suggests frequently ordered items
   - Modal allows quantity editing and bulk-add to cart
   - Integrated into Header component with "Smart List" button
   - Full test coverage for hook and modal component

2. ✅ Enhanced `src/components/ProductManager.tsx` with real image upload functionality
   - Supabase Storage integration for persistent image hosting
   - Image compression and optimization before upload
   - Product selection and automatic record updates
   - Improved UI with status indicators and preview

NEXT SUGGESTED TASKS:

1. Add a rule-based reranker hook (`src/hooks/useReranker.ts`) and wire it into `src/components/ProductSearch.tsx` as an opt-in flag.
2. Create integration tests for the shopping list and image upload features.

---

## Requirements coverage (mapping)

- POC goal 1 — Shopping-list generation: ✅ COMPLETED (order data exists; UI + hook implemented) → Status: `useShoppingList` hook, modal, and bulk-add functionality fully implemented and tested.
- POC goal 2 — Profile-driven search: PARTIAL (search exists; reranking & profile signals missing) → To Do: add reranker and user-context signals.
- POC goal 3 — AI-driven architecture (MCP + LLM): TBD (MCP not present; LLM services not present) → To Do: scaffold `src/mcp/` and `src/services/llm*`.

---

Update this file as you complete items or if priorities change.
