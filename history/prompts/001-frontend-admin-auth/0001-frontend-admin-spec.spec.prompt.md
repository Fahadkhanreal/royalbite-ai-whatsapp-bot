---
id: 0001
title: Frontend Admin Spec
stage: spec
date: 2026-05-31
surface: agent
model: cx/gpt-5.5
feature: 001-frontend-admin-auth
branch: 001-frontend-admin-auth
user: Fahadkhanreal
command: /sp.specify
labels: ["frontend", "admin-dashboard", "auth", "public-pages", "royalbite-ai"]
links:
  spec: specs/001-frontend-admin-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-frontend-admin-auth/spec.md
 - specs/001-frontend-admin-auth/checklists/requirements.md
tests:
 - Spec placeholder and clarification scan
 - Spec implementation-detail scan
 - Checklist completion scan
---

## Prompt

```text
# RoyalBite AI - Frontend Specification (Updated with NextAuth)

**Version:** 1.1  
**Date:** May 30, 2026  
**Project:** RoyalBite AI - WhatsApp RAG Restaurant Chatbot  
**Authentication:** NextAuth.js (Auth.js) v5

---

## 1. Project Overview

Modern, beautiful aur professional frontend jo **Admin Dashboard** aur **Public Landing Page** dono ko cover karega. Design premium restaurant feel ke saath hoga.

**Design Philosophy:** Premium, Clean, Warm aur Food-focused.

---

## 2. Tech Stack (Frontend)

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Library:** shadcn/ui + Radix UI
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **Authentication:** **NextAuth.js (Auth.js) v5**
- **State Management:** Zustand
- **Notifications:** Sonner
- **Theme:** Dark mode (default)

---

## 3. Folder Structure (Updated)

/app includes public pages, authentication routes, protected admin pages, reusable components, authentication configuration, database utility, middleware, and authentication types.

## 4. Pages & Routes

Public pages: landing page, public menu, and about page.
Authentication routes: admin login.
Protected admin routes: dashboard, menu, timings, knowledge, documents, orders, analytics, and settings.

## 5. Authentication Flow (NextAuth)

Provider: Credentials (Email + Password)
Session Strategy: JWT
Protected Routes: Middleware + Server Components
Role-based Access: role: "admin"
Login Redirect: Successful login → /admin
Logout: /api/auth/signout

## 6. Design System

Primary Color: #E11D48
Secondary Color: #F97316
Dark Background: #0A0A0A
Modern Cards with hover effects
Floating WhatsApp Button on public pages
Glassmorphism + Subtle gradients

## 7. Key Features & Interactions

Beautiful Login Page with restaurant branding
Sidebar Navigation (Collapsible)
Real-time notifications for new orders
Image upload with preview in Menu section
Search + Filter in all tables
Loading skeletons
Confirmation dialogs
Responsive design (Mobile + Desktop)

## 8. Non-Functional Requirements

Fully Responsive
Fast page loads (Server Components)
Secure Authentication
Proper error handling & loading states
Accessible UI
Clean, maintainable code with TypeScript

## 9. Acceptance Criteria

NextAuth login/logout properly working
All /admin/* routes protected
Session persists correctly
Login page beautiful aur branded
Admin dashboard fast aur premium look
No unauthorized access possible
Proper redirect after login/logout
```

## Response snapshot

Created feature branch and stakeholder-facing specification for the RoyalBite frontend admin/public experience. Added a requirements quality checklist and validated that the specification has no clarification markers, no unresolved placeholders, and no leaked implementation details.

## Outcome

- ✅ Impact: Feature specification is ready for planning under branch 001-frontend-admin-auth.
- 🧪 Tests: Placeholder/clarification scan, implementation-detail scan, and checklist completion scan passed.
- 📁 Files: specs/001-frontend-admin-auth/spec.md and specs/001-frontend-admin-auth/checklists/requirements.md.
- 🔁 Next prompts: Run /sp.plan to create the technical implementation plan.
- 🧠 Reflection: The user provided technical stack details, but the spec was intentionally reframed as user/business outcomes so planning can handle implementation choices.

## Evaluation notes (flywheel)

- Failure modes observed: Remote fetch failed because origin is not configured; feature creation script still created branch/spec but emitted a PowerShell positional-parameter warning after branch creation.
- Graders run and results (PASS/FAIL): PASS - no NEEDS CLARIFICATION markers; PASS - no unresolved spec placeholders; PASS - checklist complete.
- Prompt variant (if applicable): slash-command specify workflow
- Next experiment (smallest change to try): Adjust the feature creation script invocation pattern for long multi-line PowerShell arguments to avoid positional-parameter warnings.
