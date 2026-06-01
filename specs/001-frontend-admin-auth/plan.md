# Implementation Plan: Frontend Admin Experience

**Branch**: `001-frontend-admin-auth` | **Date**: 2026-05-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-frontend-admin-auth/spec.md`

## Summary

Build the RoyalBite AI public frontend and protected admin experience as a Next.js 15 App Router application. The plan delivers public landing/menu/about pages, branded admin login, admin-only route protection, a premium dark dashboard shell, and operational admin pages for menu, timings, knowledge, documents, orders, analytics, and settings.

## Technical Context

**Language/Version**: TypeScript with Next.js 15 App Router  
**Primary Dependencies**: Next.js, Auth.js v5/NextAuth, Tailwind CSS, shadcn/ui, Radix UI, Framer Motion, Lucide React, React Hook Form, Zod, Zustand, Sonner  
**Storage**: Neon PostgreSQL for users, restaurant data, menu, orders, timings, knowledge entries, documents, settings, and audit-relevant admin data  
**Testing**: Manual acceptance checks, TypeScript checks, linting, responsive review, accessibility review, and Lighthouse review  
**Target Platform**: Web application deployed on Vercel with Neon PostgreSQL  
**Project Type**: Single full-stack Next.js web application  
**Performance Goals**: Admin login-to-dashboard under 30 seconds in acceptance testing; public pages reachable without auth in all route checks; no horizontal scroll in primary mobile/tablet/desktop workflows  
**Constraints**: Admin data must never render for unauthenticated or non-admin users; secrets must stay in environment variables; public pages remain read-only; use text/UI fallbacks for unavailable data  
**Scale/Scope**: Initial RoyalBite restaurant dashboard with public pages plus admin pages for dashboard, menu, timings, knowledge, documents, orders, analytics, and settings

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Accuracy: PASS — menu, timings, knowledge, documents, orders, and settings are admin-managed records; public/admin empty states prevent guessing when data is unavailable.
- Experience: PASS — public pages and login/dashboard styling preserve the premium RoyalBite restaurant feel; customer-facing content remains warm and food-focused.
- Order Integrity: PASS — order management includes clear status transitions and admin visibility; customer order placement remains outside this frontend plan unless specified later.
- Privacy/Security: PASS — admin pages require authenticated admin access; protected data must be checked in middleware/server boundaries and secrets remain environment-based.
- Admin Knowledge: PASS — menu, timings, knowledge, documents, and settings pages provide the admin-owned update path required by the constitution.
- Reliability/Voice: PASS — voice reply generation is outside this frontend feature; UI still includes loading, empty, error, and retry states for provider/data failures.

## Project Structure

### Documentation (this feature)

```text
specs/001-frontend-admin-auth/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── admin-openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── (auth)/
│   └── login/page.tsx
├── admin/
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   ├── menu/page.tsx
│   ├── timings/page.tsx
│   ├── knowledge/page.tsx
│   ├── documents/page.tsx
│   ├── orders/page.tsx
│   ├── analytics/page.tsx
│   └── settings/page.tsx
├── api/
│   ├── auth/[...nextauth]/route.ts
│   └── admin/
│       ├── menu/route.ts
│       ├── timings/route.ts
│       ├── knowledge/route.ts
│       ├── documents/route.ts
│       ├── orders/route.ts
│       └── settings/route.ts
├── about/page.tsx
├── menu/page.tsx
├── page.tsx
├── layout.tsx
└── globals.css
components/
├── ui/
├── auth/
├── admin/
├── common/
└── layout/
lib/
├── auth.ts
├── db.ts
├── validations/
└── utils.ts
middleware.ts
types/
└── next-auth.d.ts
public/
```

**Structure Decision**: Use a single full-stack Next.js App Router application at the repository root. This matches the constitution, keeps public and admin routes in one deployable unit, and avoids unnecessary frontend/backend split complexity for the initial RoyalBite dashboard.

## Complexity Tracking

No constitution gate violations require justification.

## Phase 0: Research Summary

Research decisions are documented in [research.md](./research.md). Key outcomes:

- Use Auth.js v5 authorized callbacks and server-side role checks for protected admin access.
- Use credentials-based admin sign-in with hashed password verification and JWT role persistence.
- Use shadcn/ui/Radix patterns for accessible forms, dialogs, data tables, sidebar shell, and dark mode.
- Use server-rendered data loading where practical, with client components only for interactive forms, filters, previews, dialogs, and notifications.

## Phase 1: Design Summary

Design artifacts:

- [data-model.md](./data-model.md) defines Admin User, Menu Item, Business Timing, Knowledge Entry, Document, Order, Restaurant Settings, and notification/audit-relevant states.
- [contracts/admin-openapi.yaml](./contracts/admin-openapi.yaml) defines admin and public route contracts for menu, timings, knowledge, documents, orders, settings, dashboard, and auth-adjacent behavior.
- [quickstart.md](./quickstart.md) defines setup, environment, implementation, and validation steps for the feature.

## Post-Design Constitution Check

- Accuracy: PASS — data model separates verified admin records from UI state; contracts include empty/error responses instead of guessed values.
- Experience: PASS — quickstart requires visual review for premium dark restaurant UI and public WhatsApp CTA.
- Order Integrity: PASS — order status transitions are explicit and admin-only.
- Privacy/Security: PASS — contracts require 401/403 for protected endpoints; quickstart includes unauthenticated and non-admin route checks.
- Admin Knowledge: PASS — document and knowledge contracts support admin-owned updates and ingestion status.
- Reliability/Voice: PASS — data loading, empty states, error states, retry guidance, and text UI fallbacks are included.
