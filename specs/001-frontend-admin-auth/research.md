# Research: Frontend Admin Experience

**Feature**: 001-frontend-admin-auth  
**Date**: 2026-05-31

## Decision: Single full-stack Next.js App Router application

**Rationale**: The project constitution names Next.js 15 App Router as the full-stack framework. A single app keeps public pages, admin pages, route handlers, authentication, and shared UI components in one deployable unit. This minimizes coordination overhead for the first RoyalBite frontend release.

**Alternatives considered**:

- Separate frontend and backend applications: rejected for initial scope because it adds deployment and API coordination complexity without a current requirement.
- Static-only frontend: rejected because admin authentication, admin data operations, and protected route handling need server-side behavior.

## Decision: Auth.js v5 credentials sign-in with JWT session role persistence

**Rationale**: The user explicitly requested NextAuth/Auth.js v5 with email/password credentials, JWT session strategy, admin role access, login redirect to admin, and logout support. Auth.js documentation supports credentials providers, authorized callbacks, middleware authorization, and role persistence via JWT/session callbacks.

**Alternatives considered**:

- OAuth-only login: rejected because the feature requests email/password credentials.
- Database session-only strategy: rejected for initial scope because JWT strategy is explicitly requested and sufficient for a single admin dashboard when paired with secure callbacks and server checks.
- Client-only route protection: rejected because protected content must not render for unauthenticated or non-admin users.

## Decision: Defense-in-depth admin authorization

**Rationale**: Middleware/authorized callbacks should stop unauthenticated requests early, while server components and route handlers should verify authenticated admin role before returning protected content or data. Next.js documentation recommends checking authentication and authorization in route handlers and server-side boundaries.

**Alternatives considered**:

- Middleware-only protection: rejected because route handlers and server components still need direct checks to prevent accidental data exposure.
- Page-level client redirects only: rejected because protected data could render before redirects or be exposed through direct endpoint calls.

## Decision: Neon PostgreSQL as source of truth

**Rationale**: The constitution names Neon PostgreSQL as the source of truth for restaurant data, orders, chat history, and admin-managed content. This feature needs users, menu items, timings, knowledge entries, documents, orders, settings, and dashboard aggregates.

**Alternatives considered**:

- Browser-only local storage: rejected because admin data must be shared, persistent, and protected.
- File-based content only: rejected because menu, orders, timings, and settings need operational updates.

## Decision: shadcn/ui + Radix patterns for accessible admin UI

**Rationale**: shadcn/ui documentation provides accessible primitives and patterns for forms, dialogs, data tables, sidebars, and dark mode. This matches the premium dashboard requirement while keeping components customizable for RoyalBite branding.

**Alternatives considered**:

- Fully custom primitives: rejected because it increases accessibility and implementation risk.
- Heavy admin template dependency: rejected because it may conflict with the custom restaurant brand and adds unnecessary abstraction.

## Decision: Server-first data loading with client islands for interaction

**Rationale**: Public pages and admin page shells should load quickly and reliably. Interactive pieces such as filters, modals, image previews, drag/drop upload, toast notifications, and optimistic UI are better as client components. This preserves performance while enabling rich dashboard behavior.

**Alternatives considered**:

- All-client rendering: rejected because it increases loading cost and can complicate protected data boundaries.
- All-server rendering: rejected because forms, previews, filters, dialogs, and notifications require client interactivity.

## Decision: REST-style route contracts for admin resources

**Rationale**: Feature requirements map cleanly to resources: menu, timings, knowledge, documents, orders, settings, dashboard summary, and public menu. REST-style contracts are easy to test, align with Next.js route handlers, and can be extended later for WhatsApp/RAG integrations.

**Alternatives considered**:

- GraphQL: rejected for initial scope because the feature does not require graph-shaped queries or cross-client schema composition.
- No explicit contracts: rejected because admin data operations need clear authorization and error taxonomy.

## Decision: Validation and error-state first UX

**Rationale**: The spec requires loading states, error states, confirmations, and accessible controls. Forms should validate inputs before submission and return user-friendly errors for auth failure, unavailable data, invalid files, and destructive actions.

**Alternatives considered**:

- Minimal happy-path UI: rejected because it violates acceptance criteria and the constitution's reliability/customer trust expectations.
