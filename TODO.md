- [ ] Integrate real product image upload logic in `ProductManager.tsx` (replace demo URL logic with actual backend upload, e.g., Supabase Storage or S3)

# Project TODO

## ✅ Features Done

- Category and product schema with UUIDs and referential integrity
- 4-level category hierarchy with safe and destructive setup scripts
- Product auto-generation for empty categories
- React UI for category management (CategoryManager)
- Product grid and search components
- Supabase integration for data
- TanStack Router setup with codegen
- Automated changelog and versioning (standard-version + Husky)
- Testing best practices and instructions
- Security and TypeScript guidelines
- Core user authentication & role-based access foundations (see breakdown below)

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

### Upcoming (Select Next Focus)

Pick next initiative (move chosen items into active list):

- Product catalog enhancements (bulk import/export, pagination, image optimization)
- Category UX (drag & drop reorder, breadcrumbs, category-level role restrictions)
- Cart & pricing (persistent cart, role-based pricing tiers, discount codes)
- Search & filtering (full-text search, faceted filters, debounced suggestions)
- Admin improvements (audit log, user impersonation, soft delete/restore)
- Security hardening (refresh token rotation, session timeout UI, email verification banner)
- Testing & quality (MSW API mocking, broader mutation tests, E2E smoke flow)
- Performance (query cache audit, bundle splitting, error boundaries & logging)
- Deployment readiness (env schema validation, health/status route, Supabase migration automation)

## 📋 Remaining General Backlog

- Shopping cart functionality (branch: feat/cart)
- Order management and checkout flow
- API endpoints for cart and orders
- Admin dashboard for product/category management
- Responsive/mobile UI improvements
- E2E tests for critical user flows
- Performance optimizations (lazy loading, bundle analysis)
- Accessibility audit and improvements
- Documentation for deployment and environment setup
- Optimize database: replace generic product/category names with realistic, diverse names for better search testing

---

Update this file as features are completed or added.
