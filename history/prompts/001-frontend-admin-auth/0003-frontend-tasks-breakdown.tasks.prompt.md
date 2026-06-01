---
id: 0003
title: Frontend Tasks Breakdown
stage: tasks
date: 2026-06-01
surface: agent
model: cx/gpt-5.5
feature: 001-frontend-admin-auth
branch: 001-frontend-admin-auth
user: Fahadkhanreal
command: /sp.tasks
labels: ["frontend", "tasks", "admin-dashboard", "auth", "nextjs"]
links:
  spec: specs/001-frontend-admin-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-frontend-admin-auth/tasks.md
 - history/prompts/001-frontend-admin-auth/0003-frontend-tasks-breakdown.tasks.prompt.md
tests:
 - check-prerequisites.ps1 -Json
 - Task checklist format regex validation
 - Placeholder and clarification scan
 - Task count validation
---

## Prompt

```text
RoyalBite AI - Frontend Tasks Breakdown
Total Phases: 6
Estimated Time: 10–14 days

Phase 1: Project Setup & Foundation (Day 1-2)
Tasks:

Next.js 15 project create karo (npx create-next-app@latest royalbite-ai --typescript --tailwind --eslint --app)
Project ko VS Code mein open karo
shadcn/ui initialize karo (npx shadcn@latest init)
Important shadcn components add karo:
Button, Card, Input, Label, Table, Dialog, Dropdown, Sidebar, Avatar, Badge, Toast, Skeleton

Tailwind config update karo (custom colors: primary #E11D48, secondary #F97316 etc.)
Folder structure create karo (spec ke according)
Framer Motion, Lucide React, Sonner, React Hook Form + Zod install karo
Root layout mein dark theme + metadata setup karo
.env.local file banao aur basic variables add karo

Milestone: Clean Next.js project with design system ready.

Phase 2: Authentication with NextAuth (Day 2-4)
Tasks:

NextAuth.js v5 install karo (npm install next-auth)
lib/auth.ts file banao aur NextAuth config likho (Credentials Provider)
/app/api/auth/[...nextauth]/route.ts banao
Login Page (/admin/login) design aur code karo
middleware.ts banao for protecting /admin/* routes
Protected Admin Layout (/admin/layout.tsx) banao
NextAuth types update karo (types/next-auth.d.ts)
Logout functionality add karo
Login form validation (Zod) + error handling

Milestone: Working login/logout with protected admin routes.

Phase 3: Admin Dashboard Core Layout (Day 4-7)
Tasks:

Sidebar Component banao (Collapsible, Responsive, with navigation links)
Navbar Component banao (Logo, Search, Notifications, Profile, Theme Toggle)
Dashboard Home Page (/admin/dashboard/page.tsx)
Stats Cards (Total Orders, Messages Today, etc.)
Recent Orders Table
Popular Dishes

Responsive sidebar (mobile menu)
Toast notifications setup (Sonner)
Loading skeleton components banao

Milestone: Professional Admin Dashboard shell + navigation ready.

Phase 4: Main Feature Pages (Day 7-11)
Priority-wise Tasks:
Menu Management (/admin/menu)

Dish Grid + Table view
Add New Dish Modal (with image upload)
Edit Dish Modal
Delete functionality

Orders Management (/admin/orders)

Orders listing with filters (Pending, Confirmed, Delivered)
Order Details Modal
Status update buttons

Business Timings (/admin/timings)

Weekly schedule form
Special days / holidays

RAG Documents (/admin/documents)

Drag & Drop upload zone
Uploaded files list
"Re-index All" button

Knowledge Base (/admin/knowledge)

Offers, Policies, FAQs management

Settings (/admin/settings)

Restaurant profile, Bot greeting, Voice settings


Phase 5: UI Polish & Animations (Day 12-13)
Tasks:

Framer Motion se page transitions aur hover animations add karo
All modals mein smooth animation
Loading states improve karo
Mobile responsiveness check aur fix
Overall UI polish (spacing, colors, typography)
Floating WhatsApp Button on public landing page


Phase 6: Testing & Finalization (Day 14)
Tasks:

Full manual testing (Login → All pages → Forms)
Auth flow test (protected routes)
Form validation test
Responsive test (Mobile, Tablet, Desktop)
Performance check
Code cleanup + comments
Final review
```

## Response snapshot

Generated a user-story-organized, immediately executable tasks.md for the RoyalBite frontend/admin feature. The task list contains setup, foundational auth/data/UI tasks, user story phases for secure admin sign-in, public visitor pages, admin operations, and final polish/validation.

## Outcome

- ✅ Impact: Implementation can proceed via /sp.implement or manual task execution.
- 🧪 Tests: Prerequisite check, task format regex validation, placeholder scan, and task count validation completed.
- 📁 Files: Created specs/001-frontend-admin-auth/tasks.md and this PHR.
- 🔁 Next prompts: Run /sp.implement to execute tasks, starting with T001.
- 🧠 Reflection: Mapping tasks by user story keeps the secure admin MVP independently testable before public pages and full admin operations.

## Evaluation notes (flywheel)

- Failure modes observed: None blocking.
- Graders run and results (PASS/FAIL): PASS - 74 task checklist lines found; PASS - no unresolved template placeholders; PASS - no invalid task checkbox/ID lines found.
- Prompt variant (if applicable): slash-command tasks workflow
- Next experiment (smallest change to try): Add a stricter task validator that also checks every non-setup/non-polish user-story phase task includes a [US#] label.
