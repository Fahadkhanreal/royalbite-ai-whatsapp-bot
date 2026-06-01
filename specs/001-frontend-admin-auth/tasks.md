
# Tasks: Frontend Admin Experience

**Input**: Design documents from `/specs/001-frontend-admin-auth/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/admin-openapi.yaml, quickstart.md
**Tests**: Manual acceptance, TypeScript, lint, responsive, accessibility, and Lighthouse checks are included in final validation. Dedicated automated test files are not generated because the feature spec did not request TDD.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Every task includes exact file paths for implementation clarity

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the Next.js application foundation, design system, shared directories, and base configuration.

- [X] T001 Initialize the Next.js 15 App Router TypeScript project with Tailwind and ESLint in `package.json`, `app/layout.tsx`, `app/page.tsx`, and `app/globals.css`
- [X] T002 Install runtime dependencies for Auth.js, shadcn/ui, Radix UI, Framer Motion, Lucide React, React Hook Form, Zod, Zustand, Sonner, and database access in `package.json`
- [X] T003 [P] Configure TypeScript path aliases and strict project defaults in `tsconfig.json`
- [X] T004 [P] Configure Tailwind dark theme tokens and RoyalBite colors in `tailwind.config.ts` and `app/globals.css`
- [X] T005 Initialize shadcn/ui configuration in `components.json` and add Button, Card, Input, Label, Table, Dialog, Dropdown Menu, Sidebar, Avatar, Badge, Toast/Sonner, and Skeleton components under `components/ui/`
- [X] T006 Create project directory structure for `app/(auth)/login/`, `app/admin/`, `app/api/admin/`, `components/auth/`, `components/admin/`, `components/common/`, `components/layout/`, `lib/validations/`, and `types/`
- [X] T007 [P] Add environment variable documentation with required `DATABASE_URL`, `AUTH_SECRET`, and `AUTH_URL` placeholders in `.env.example`
- [X] T008 Configure root metadata, dark default styling, and app-wide providers in `app/layout.tsx` and `components/common/app-providers.tsx`
- [X] T009 [P] Add shared utility helpers for class names, formatting, and constants in `lib/utils.ts` and `lib/constants.ts`

**Checkpoint**: Next.js foundation, dependency list, design tokens, shared folders, and providers are ready.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared database, validation, auth, authorization, layout primitives, and API helpers required before any user story can be completed.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T010 Create Neon PostgreSQL client helper and safe server-only access wrapper in `lib/db.ts`
- [X] T011 Define shared domain types for Admin User, Menu Item, Business Timing, Knowledge Entry, RAG Document, Order, Restaurant Settings, and Dashboard Summary in `types/domain.ts`
- [X] T012 [P] Define validation schemas for login, menu items, timings, knowledge entries, documents, orders, and settings in `lib/validations/admin.ts`
- [X] T013 Create mock/seed-safe repository functions for admin user lookup and role checks in `lib/repositories/admin-users.ts`
- [X] T014 Create repository functions for menu, timings, knowledge, documents, orders, settings, and dashboard summary in `lib/repositories/admin-data.ts`
- [X] T015 Configure Auth.js credentials provider, JWT role persistence, session callback, and authorized callback in `lib/auth.ts`
- [X] T016 Add Auth.js route handlers in `app/api/auth/[...nextauth]/route.ts`
- [X] T017 Add NextAuth session and JWT role type augmentation in `types/next-auth.d.ts`
- [X] T018 Implement middleware protection for `/admin/:path*` routes in `middleware.ts`
- [X] T019 Create server-side `requireAdmin()` helper for server components and route handlers in `lib/admin-auth.ts`
- [X] T020 Create reusable API response helpers for 400, 401, 403, 404, and 500 responses in `lib/api-response.ts`
- [X] T021 [P] Create reusable loading, empty, error, confirmation, and page header components in `components/common/feedback-states.tsx` and `components/common/page-header.tsx`
- [X] T022 [P] Create reusable form field and submit button wrappers in `components/common/form-controls.tsx`
- [X] T023 Create shared admin data table wrapper with search/filter slots in `components/admin/admin-data-table.tsx`
- [X] T024 Create shared image/file preview helpers for admin forms in `components/admin/file-preview.tsx`

**Checkpoint**: Database access, validation, authentication, authorization, shared UI primitives, and route-handler helpers are ready.

---

## Phase 3: User Story 1 - Admin signs in securely (Priority: P1) 🎯 MVP

**Goal**: A valid admin can sign in, reach the dashboard, keep a session across refreshes, sign out, and block unauthenticated/non-admin access.

**Independent Test**: Attempt login with valid admin credentials, invalid credentials, and non-admin credentials; verify redirects, protected content visibility, refresh persistence, and logout behavior.

### Implementation for User Story 1

- [X] T025 [P] [US1] Create branded admin login page shell in `app/(auth)/login/page.tsx`
- [X] T026 [US1] Implement validated login form with credential submission and friendly errors in `components/auth/login-form.tsx`
- [X] T027 [US1] Wire successful login redirect to `/admin/dashboard` and failed login feedback in `components/auth/login-form.tsx`
- [X] T028 [P] [US1] Create protected admin layout with server-side admin guard in `app/admin/layout.tsx`
- [X] T029 [US1] Implement admin session display and logout control in `components/auth/logout-button.tsx`
- [X] T030 [US1] Add unauthorized/non-admin fallback handling in `app/admin/forbidden.tsx` or `app/admin/not-authorized/page.tsx`
- [X] T031 [US1] Create minimal protected dashboard landing content for auth validation in `app/admin/dashboard/page.tsx`
- [X] T032 [US1] Add auth acceptance checklist instructions to `specs/001-frontend-admin-auth/quickstart.md`

**Checkpoint**: User Story 1 is fully functional and testable independently as the MVP.

---

## Phase 4: User Story 2 - Visitor explores RoyalBite publicly (Priority: P2)

**Goal**: Public visitors can access landing, menu, and about pages without signing in and can quickly find the WhatsApp contact action.

**Independent Test**: Visit `/`, `/menu`, and `/about` while signed out on mobile and desktop; confirm premium restaurant content, read-only menu behavior, about details, and WhatsApp entry points.

### Implementation for User Story 2

- [X] T033 [P] [US2] Build premium public landing page hero, feature sections, and WhatsApp call-to-action in `app/page.tsx`
- [X] T034 [P] [US2] Create floating WhatsApp button component in `components/common/floating-whatsapp-button.tsx`
- [X] T035 [US2] Add floating WhatsApp button to public layout usage in `app/page.tsx`, `app/menu/page.tsx`, and `app/about/page.tsx`
- [X] T036 [P] [US2] Implement public read-only menu route handler in `app/api/admin/menu/public-route-notes.md` or public menu data helper in `lib/repositories/public-menu.ts`
- [X] T037 [US2] Build read-only public menu page with empty state handling in `app/menu/page.tsx`
- [X] T038 [P] [US2] Build public about page with restaurant identity and customer promise in `app/about/page.tsx`
- [ ] T039 [US2] Validate signed-out access and responsive behavior for public pages using `specs/001-frontend-admin-auth/quickstart.md`

**Checkpoint**: User Story 2 works independently without admin authentication.

---

## Phase 5: User Story 3 - Admin manages restaurant operations (Priority: P3)

**Goal**: A signed-in admin can navigate the admin shell and manage dashboard, menu, timings, knowledge, documents, orders, analytics, and settings with search/filter, confirmations, and loading/error states.

**Independent Test**: Sign in as admin, navigate all admin sections within two clicks, use search/filter controls, verify destructive confirmations, update status/forms, and confirm responsive layout.

### Implementation for User Story 3

- [X] T040 [P] [US3] Create collapsible responsive admin sidebar with navigation links in `components/layout/admin-sidebar.tsx`
- [X] T041 [P] [US3] Create admin top navbar with search, notifications, profile, theme toggle, and logout slot in `components/layout/admin-navbar.tsx`
- [X] T042 [US3] Integrate sidebar and navbar into protected admin layout in `app/admin/layout.tsx`
- [ ] T043 [P] [US3] Implement dashboard summary API route with admin guard in `app/api/admin/dashboard/route.ts`
- [X] T044 [US3] Build dashboard stats cards, recent orders, and popular dishes in `app/admin/dashboard/page.tsx` and `components/admin/dashboard-widgets.tsx`
- [X] T045 [P] [US3] Implement menu CRUD route handlers with admin guard in `app/api/admin/menu/route.ts` and `app/api/admin/menu/[id]/route.ts`
- [X] T046 [US3] Build menu management page with grid/table toggle in `app/admin/menu/page.tsx`
- [X] T047 [US3] Build add/edit dish dialog with image preview and Zod validation in `components/admin/menu-item-dialog.tsx`
- [X] T048 [US3] Add delete dish confirmation flow in `components/admin/menu-delete-dialog.tsx`
- [X] T049 [P] [US3] Implement orders list and status update route handlers in `app/api/admin/orders/route.ts` and `app/api/admin/orders/[id]/status/route.ts`
- [X] T050 [US3] Build orders management page with status filters and search in `app/admin/orders/page.tsx`
- [X] T051 [US3] Build order details modal and status update controls in `components/admin/order-details-dialog.tsx`
- [X] T052 [P] [US3] Implement business timings route handler in `app/api/admin/timings/route.ts`
- [X] T053 [US3] Build weekly timings and special-days form in `app/admin/timings/page.tsx`
- [X] T054 [P] [US3] Implement knowledge entries route handler in `app/api/admin/knowledge/route.ts`
- [X] T055 [US3] Build offers, policies, and FAQs management page in `app/admin/knowledge/page.tsx`
- [X] T056 [P] [US3] Implement document list, upload, and re-index route handlers in `app/api/admin/documents/route.ts` and `app/api/admin/documents/[id]/reindex/route.ts`
- [X] T057 [US3] Build drag-and-drop RAG documents page with ingestion status and re-index action in `app/admin/documents/page.tsx`
- [X] T058 [P] [US3] Build analytics dashboard page with readable performance indicators in `app/admin/analytics/page.tsx`
- [X] T059 [P] [US3] Implement settings route handler in `app/api/admin/settings/route.ts`
- [X] T060 [US3] Build restaurant profile, bot greeting, and voice settings form in `app/admin/settings/page.tsx`
- [X] T061 [US3] Add Sonner toast notifications for successful and failed admin actions in `components/admin/admin-action-toasts.tsx`
- [X] T062 [US3] Add loading skeletons to all admin pages in `app/admin/dashboard/loading.tsx`, `app/admin/menu/loading.tsx`, `app/admin/orders/loading.tsx`, `app/admin/timings/loading.tsx`, `app/admin/knowledge/loading.tsx`, `app/admin/documents/loading.tsx`, `app/admin/analytics/loading.tsx`, and `app/admin/settings/loading.tsx`
- [ ] T063 [US3] Validate admin navigation, search/filter, confirmations, status transitions, uploads, and responsive behavior using `specs/001-frontend-admin-auth/quickstart.md`

**Checkpoint**: User Story 3 delivers the full admin operational dashboard and remains testable independently after sign-in.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improve quality, responsiveness, accessibility, performance, and release readiness across all completed user stories.

- [X] T064 [P] Add Framer Motion page transition and hover animation wrappers in `components/common/motion-wrappers.tsx`
- [X] T065 Apply modal and micro-interaction animations to admin dialogs in `components/admin/menu-item-dialog.tsx`, `components/admin/menu-delete-dialog.tsx`, and `components/admin/order-details-dialog.tsx`
- [ ] T066 Improve spacing, typography, contrast, and RoyalBite visual polish across `app/globals.css`, `app/page.tsx`, and `app/admin/layout.tsx`
- [ ] T067 Run responsive review and fix mobile/tablet/desktop layout issues in `components/layout/admin-sidebar.tsx`, `components/layout/admin-navbar.tsx`, and all `app/admin/*/page.tsx` files
- [ ] T068 Run accessibility review and fix labels, keyboard focus, dialog semantics, and contrast in `components/auth/login-form.tsx`, `components/common/form-controls.tsx`, and `components/admin/*`
- [X] T069 Run auth-flow manual validation from quickstart and document results in `specs/001-frontend-admin-auth/validation-results.md`
- [X] T070 Run public-page manual validation from quickstart and document results in `specs/001-frontend-admin-auth/validation-results.md`
- [X] T071 Run admin workflow manual validation from quickstart and document results in `specs/001-frontend-admin-auth/validation-results.md`
- [X] T072 Run TypeScript, lint, and production build checks and document commands/results in `specs/001-frontend-admin-auth/validation-results.md`
- [X] T073 Run Lighthouse or equivalent performance/accessibility review for public pages and document results in `specs/001-frontend-admin-auth/validation-results.md`
- [X] T074 Update implementation notes and environment setup guidance in `README.md` and `specs/001-frontend-admin-auth/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational; recommended MVP.
- **User Story 2 (Phase 4)**: Depends on Setup/Foundational; can be implemented after US1 or in parallel with US3 once auth foundation is stable.
- **User Story 3 (Phase 5)**: Depends on Foundational and benefits from US1 auth completion.
- **Polish (Phase 6)**: Depends on desired user stories being implemented.

### User Story Dependencies

- **US1 Admin signs in securely**: No dependency on US2/US3; MVP security foundation.
- **US2 Visitor explores RoyalBite publicly**: Independent of admin-only workflows after shared setup.
- **US3 Admin manages restaurant operations**: Requires US1 authentication and protected admin layout.

### Within Each User Story

- Shared schemas/repositories before pages that consume them.
- Route handlers before interactive admin pages that submit data.
- Dialog/forms before page-level integration that opens them.
- Loading/error/empty states before final acceptance validation.

### Parallel Opportunities

- Setup tasks T003, T004, T007, and T009 can run in parallel after T001/T002.
- Foundational tasks T012, T021, T022 can run in parallel with repository/auth work.
- US2 public pages T033, T034, T036, and T038 can run in parallel.
- US3 route handlers T043, T045, T049, T052, T054, T056, T059 can run in parallel after T019/T020.
- US3 independent pages T053, T055, T057, T058, T060 can run in parallel after their route/data helpers exist.
- Polish tasks T064, T068, and validation documentation tasks can run in parallel where files do not overlap.

---

## Parallel Example: User Story 1

```bash
Task: "Create branded admin login page shell in app/(auth)/login/page.tsx"
Task: "Create protected admin layout with server-side admin guard in app/admin/layout.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Build premium public landing page hero, feature sections, and WhatsApp call-to-action in app/page.tsx"
Task: "Build public about page with restaurant identity and customer promise in app/about/page.tsx"
Task: "Create floating WhatsApp button component in components/common/floating-whatsapp-button.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Implement menu CRUD route handlers with admin guard in app/api/admin/menu/route.ts and app/api/admin/menu/[id]/route.ts"
Task: "Implement orders list and status update route handlers in app/api/admin/orders/route.ts and app/api/admin/orders/[id]/status/route.ts"
Task: "Implement business timings route handler in app/api/admin/timings/route.ts"
Task: "Implement knowledge entries route handler in app/api/admin/knowledge/route.ts"
Task: "Implement document list, upload, and re-index route handlers in app/api/admin/documents/route.ts and app/api/admin/documents/[id]/reindex/route.ts"
Task: "Implement settings route handler in app/api/admin/settings/route.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational prerequisites.
3. Complete Phase 3: User Story 1 admin sign-in and protection.
4. Stop and validate: login, invalid login, non-admin denial, protected route redirect, refresh persistence, and logout.

### Incremental Delivery

1. Setup + Foundational → working project foundation.
2. US1 → secure admin login/logout and protected routes.
3. US2 → public landing/menu/about and WhatsApp CTA.
4. US3 → full admin operational dashboard.
5. Polish → animation, responsiveness, accessibility, performance, and final validation.

### Parallel Team Strategy

With multiple contributors:

1. One contributor owns setup/auth foundation.
2. One contributor owns public pages after shared UI is ready.
3. One or more contributors own admin resource pages after shared route/auth helpers are ready.
4. One contributor owns cross-cutting validation and polish after each story checkpoint.

---

## Notes

- Tests are manual/acceptance-focused because the spec did not request TDD or automated tests.
- Every task includes a concrete file path and follows `- [ ] T### [P?] [US?] Description with file path` format.
- Do not commit `.env.local`; use `.env.example` for documented placeholders.
- Stop at each checkpoint and validate the relevant user story independently.
