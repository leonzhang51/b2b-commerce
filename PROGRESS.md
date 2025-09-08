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
  - Checkout & orders: `src/usecases/CheckoutUseCase.ts`, `src/models/ordersRepository.ts`, `src/hooks/useCheckout.ts`, `sql/setup-orders.sql`, `sql/rpc-create-order.sql`, `sql/migrate-add-idempotency-key.sql`
  - Utils & infra: `src/lib/supabase.ts`, `src/utils/imageUtils.ts` (compression demo)

## Status by POC Goal

- Goal 1 — Shopping-list generation: COMPLETED ✅
- What exists: `useShoppingList` heuristic hook and `ShoppingListModal` UI implemented and tested.
- Files: `src/hooks/useShoppingList.ts`, `src/components/ShoppingListModal.tsx` (integrated into Header with Smart List button)

- Goal 2 — Profile-aware search: PARTIAL
  - What exists: search and faceted filters are implemented (`ProductSearch`, filters). User-context signals and reranking missing.
  - To do: add rule-based reranker and then LLM-based reranker. Suggested files: `src/hooks/useReranker.ts`, `src/services/llmReranker.ts`.

- Goal 3 — AI-driven architecture (MCP + LLM): TODO / scaffold
  - What exists: general app infra; no MCP adapters or LLM services implemented.
  - To do: scaffold `src/mcp/` for data adapters, add `src/services/llmService.ts` and `src/services/recommendationService.ts`.

## Short-term Next Actions (prio order)

1. Rule-based reranker — PRIORITY

- Implement `src/hooks/useReranker.ts` and wire into `src/components/ProductSearch.tsx` behind an opt-in flag. (Timebox: 3–4 days)

2. Integration tests — RECOMMENDED

- Create integration tests for create-order (applies migrations and asserts rows in `orders` and `order_items`) and shopping-list flow. Consider Dockerized Postgres for local CI runs. (Timebox: 2–3 days)

3. Frontend checkout wiring — WIRED; integration test pending (Timebox: 1–2 days)

- Note: frontend calls `/api/create-order` (`src/hooks/useCheckout.ts`), route and RPC usage exist. Current tests are unit/mocked.

4. Idempotency migration — DONE (applied in Supabase)

- Status: `idempotency_key` column and partial unique index present. Optional: run concurrency validation in staging.

## Medium-term Actions (2–6 weeks)

- Scaffold MCP adapters under `src/mcp/` and migrate read operations used by LLM prompts.
- Add LLM-based reranker and shopping-list generator; make these services pluggable behind feature flags.
- Add E2E smoke tests (login → search → add-to-cart → checkout).

## Risks & Blockers

- LLM integration requires API keys and secure handling of credentials — do not commit secrets.
- Running integration tests against a real DB requires a test database or CI configuration mirroring staging.

## Suggested Immediate Work for Copilot

1. Implement rule-based reranker hook `src/hooks/useReranker.ts` and wire into `src/components/ProductSearch.tsx` behind an opt-in flag.
2. Create integration test scaffolds under `src/__tests__/integration/` for create-order and shopping-list flows (use Dockerized Postgres or CI test DB).
3. Begin scaffolding `src/mcp/` adapters for product and order reads to prepare for LLM features.

If requested, I can implement (1) and (2) now and add CI instructions to run integration tests against a test Postgres.

---

Update this file as the POC progresses. Reference `TODO.md` for the detailed roadmap and per-file mappings.
