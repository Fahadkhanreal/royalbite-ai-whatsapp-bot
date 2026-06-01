# Quickstart: Frontend Admin Experience

**Feature**: 001-frontend-admin-auth  
**Date**: 2026-05-31

## Prerequisites

- Node.js compatible with the selected Next.js release
- Package manager selected by the project during setup
- Neon PostgreSQL connection string
- Auth secret configured in local environment
- Admin seed account for acceptance testing

## Environment

Create `.env.local` for local development. Do not commit secrets.

Required values:

```text
DATABASE_URL=<neon-postgres-url>
AUTH_SECRET=<strong-random-secret>
AUTH_URL=http://localhost:3000
```

Add provider-specific or upload-specific values only when the implementation introduces them.

## Implementation order

1. Create the Next.js App Router project foundation with TypeScript and Tailwind.
2. Add the RoyalBite dark design system, global layout, and shared UI primitives.
3. Add public landing, menu, and about pages.
4. Add Auth.js credentials sign-in, JWT role persistence, and admin session helpers.
5. Add middleware and server-side admin checks for all `/admin/*` pages and admin data routes.
6. Add admin layout with responsive sidebar, top navigation, notifications area, and profile/sign-out controls.
7. Add admin pages in this order:
   - dashboard
   - menu
   - orders
   - timings
   - knowledge
   - documents
   - analytics
   - settings
8. Add loading, empty, error, success, and confirmation states for primary workflows.
9. Run acceptance checks.

## Acceptance checks

### Public route checks

- Visit `/` while signed out; confirm premium RoyalBite landing content and WhatsApp action are visible.
- Visit `/menu` while signed out; confirm read-only menu behavior and empty state handling.
- Visit `/about` while signed out; confirm restaurant details render.

### Auth checks

Demo admin credentials for local acceptance testing:

```text
Email: admin@royalbite.local
Password: RoyalBiteAdmin123!
```

- Visit `/admin/dashboard` while signed out; confirm redirect to login before protected content appears.
- Sign in with invalid credentials; confirm friendly error and no protected content.
- Sign in with a non-admin account; confirm admin access is denied.
- Sign in with the valid demo admin account; confirm redirect to the dashboard.
- Refresh the dashboard; confirm the admin session persists.
- Sign out; confirm protected routes require login again.

### Admin workflow checks

- Navigate to dashboard, menu, timings, knowledge, documents, orders, analytics, and settings within two clicks from the admin shell.
- On table pages, verify search/filter controls update visible rows predictably.
- Verify destructive actions require confirmation.
- Verify menu image preview handles supported and unsupported files.
- Verify order status updates follow allowed transitions.
- Verify document upload shows uploaded, processing, indexed, or failed states.

### UI quality checks

- Review mobile, tablet, and desktop layouts; primary workflows must not horizontally scroll.
- Confirm loading, empty, error, and success states appear for primary flows.
- Confirm keyboard focus is visible and form fields have accessible labels.
- Run Lighthouse or equivalent review for public pages and address major performance/accessibility issues.

## Done criteria

- All protected admin routes pass unauthenticated and non-admin checks.
- Public pages work without login.
- Admin login/logout works and redirects correctly.
- Admin shell and required sections exist.
- Main admin pages include loading/error/empty states.
- Responsive and accessibility review passes the feature checklist.
