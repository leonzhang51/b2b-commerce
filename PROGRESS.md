# Project Progress — B2B Commerce POC

Date: 2025-09-05

This file gives a compact, actionable status snapshot for the B2B Commerce proof-of-concept, maps items to code locations, and lists next actions for the Copilot / maintainers.

## POC Goals

1. New B2B UX: auto-generate shopping lists from user order history + profile (role, project, etc.)
2. Profile-aware search: surface and rerank results to match user profile and history
3. AI-driven architecture: adopt a Model Context Protocol (MCP) for DB access and use LLMs for search, reranking, and shopping-list generation

## Current Snapshot (high level)

- App type: React + TypeScript SPA, Supabase for auth & DB, TanStack for query/router, Zustand for client state.
- Core working pieces: Authentication, Product UI (grid/search/filters), Cart store (persistent), Checkout use-case orchestration, Admin tools (category/product management, audit log), many unit tests.
- Key files and artifacts:
  - Auth & security: `src/hooks/useAuth.ts`, `src/store/securityStore.ts`, `src/components/RequireAuth.tsx`
  - Product UI & search: `src/components/ProductGrid.tsx`, `src/components/ProductSearch.tsx`, `src/components/ProductFacetedFilters.tsx`
  - Cart & pricing: `src/store/cartStore.ts`, `src/lib/rolePricing.ts`, `src/lib/discountCodes.ts`
  - Checkout & orders: `src/usecases/CheckoutUseCase.ts`, `src/models/ordersRepository.ts`, `sql/setup-orders.sql`, `sql/rpc-create-order.sql`, `sql/migrate-add-idempotency-key.sql`
  - Utils & infra: `src/lib/supabase.ts`, `src/utils/imageUtils.ts` (compression demo)

## Status by POC Goal

- Goal 1 — Shopping-list generation: PARTIAL
  - What exists: order schema + order history is present in DB artifacts; no dedicated shopping-list hook or modal in UI.
  - To do: implement `src/hooks/useShoppingList.ts`, `src/components/ShoppingListModal.tsx`, bulk-add to cart wiring.

- Goal 2 — Profile-aware search: PARTIAL
  - What exists: search and faceted filters are implemented (`ProductSearch`, filters). User-context signals and reranking missing.
  - To do: add rule-based reranker and then LLM-based reranker. Suggested files: `src/hooks/useReranker.ts`, `src/services/llmReranker.ts`.

- Goal 3 — AI-driven architecture (MCP + LLM): TODO / scaffold
  - What exists: general app infra; no MCP adapters or LLM services implemented.
  - To do: scaffold `src/mcp/` for data adapters, add `src/services/llmService.ts` and `src/services/recommendationService.ts`.

## Short-term Next Actions (prio order)

1. Implement shopping-list spike (heuristic) — create `useShoppingList` + `ShoppingListModal` and unit tests. (Timebox: 3 days)
2. Add a small rule-based reranker and wire it into `ProductSearch` as opt-in (allow comparison). (Timebox: 3–4 days)
3. Wire frontend checkout to server RPC + add integration test that asserts order rows are created. (Timebox: 2–3 days)
4. Apply idempotency migration to staging and run concurrency test. (Ops)

## Medium-term Actions (2–6 weeks)

- Scaffold MCP adapters under `src/mcp/` and migrate read operations used by LLM prompts.
- Add LLM-based reranker and shopping-list generator; make these services pluggable behind feature flags.
- Add E2E smoke tests (login → search → add-to-cart → checkout).

## Risks & Blockers

- LLM integration requires API keys and secure handling of credentials — do not commit secrets.
- Running integration tests against a real DB requires a test database or CI configuration mirroring staging.

## Suggested Immediate Work for Copilot

1. Create `src/hooks/useShoppingList.ts` with a heuristic implementation using recent order items and role-based templates. Export a function returning suggested items + confidence score.
2. Add `src/components/ShoppingListModal.tsx` (presentation-only, client-side) that consumes the hook and allows bulk-add to cart.
3. Add unit tests under `src/__tests__/` for the hook and modal.

If requested, I (the copilot) can create those files, wire a minimal demo, and add tests now.

---

Update this file as the POC progresses. Reference `TODO.md` for the detailed roadmap and per-file mappings.
