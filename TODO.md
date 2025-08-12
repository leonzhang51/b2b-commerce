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

## 🟡 Features To Be Done

User authentication and roles - [ ] Implement registration, login, and logout UI (sign up, sign in, sign out) - [ ] Integrate Supabase Auth for user management - [ ] Add email confirmation and password reset flows - [ ] Store additional user profile fields (name, company, phone, etc.) in public.users - [ ] Sync Supabase auth.users with public.users via trigger or app logic - [ ] Implement role assignment (admin, manager, buyer, etc.) in public.users or a roles table - [ ] Add role-based route protection (RequireRole component) - [ ] Add admin UI for managing users and roles - [ ] Enforce Row Level Security (RLS) in Supabase for data access by role - [ ] Test all authentication and authorization flows

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
