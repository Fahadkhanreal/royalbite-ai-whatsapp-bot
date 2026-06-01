---
id: 0002
title: Frontend Development Plan
stage: plan
date: 2026-05-31
surface: agent
model: cx/gpt-5.5
feature: 001-frontend-admin-auth
branch: 001-frontend-admin-auth
user: Fahadkhanreal
command: /sp.plan
labels: ["frontend", "implementation-plan", "auth", "admin-dashboard", "nextjs"]
links:
  spec: specs/001-frontend-admin-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-frontend-admin-auth/plan.md
 - specs/001-frontend-admin-auth/research.md
 - specs/001-frontend-admin-auth/data-model.md
 - specs/001-frontend-admin-auth/contracts/admin-openapi.yaml
 - specs/001-frontend-admin-auth/quickstart.md
 - CLAUDE.md
tests:
 - setup-plan.ps1 -Json
 - update-agent-context.ps1 -AgentType claude
 - Placeholder and clarification scan for plan artifacts
---

## Prompt

```text
# RoyalBite AI - Frontend Development Plan

**Version:** 1.0  
**Date:** May 30, 2026  
**Goal:** High-quality, professional aur scalable frontend banane ka step-by-step plan

---

## 1. Project Phases (Total Estimated Time: 10-14 days)

| Phase | Duration     | Focus Area                        | Status     |
|------|--------------|-----------------------------------|----------|
| 1    | 1-2 days     | Setup + Foundation                | Pending  |
| 2    | 2-3 days     | Authentication (NextAuth)         | Pending  |
| 3    | 3-4 days     | Admin Dashboard Layout + Core     | Pending  |
| 4    | 2-3 days     | Main Features (Menu, Orders etc.) | Pending  |
| 5    | 1-2 days     | Polish, Animations & Responsiveness | Pending |
| 6    | 1 day        | Testing & Final Optimization      | Pending  |

---

## 2. Phase-wise Detailed Plan

### **Phase 1: Project Setup & Foundation (Day 1-2)**

- Next.js 15 project create karo (TypeScript + Tailwind + App Router)
- shadcn/ui setup karo
- Tailwind config + Custom design system (colors, fonts, spacing)
- Folder structure banao (jaise spec mein diya gaya)
- Environment variables setup (`.env.local`)
- Basic layout (`root layout.tsx`)
- Dark mode enable karo
- Lucide icons + Framer Motion install

**Milestone:** Clean, configured Next.js project with design system ready.

---

### **Phase 2: Authentication with NextAuth (Day 2-4)**

- NextAuth v5 setup (`lib/auth.ts`)
- Credentials Provider implementation
- Neon database tables for users + accounts + sessions
- Login Page (`/admin/login`)
- Middleware for protecting `/admin/*` routes
- Protected Admin Layout
- Logout functionality
- Type definitions (`next-auth.d.ts`)

**Milestone:** Secure login/logout working with protected routes.

---

### **Phase 3: Admin Dashboard Core Layout (Day 4-7)**

- Sidebar Navigation (Collapsible + Responsive)
- Top Navbar (Search, Notifications, Profile, Theme toggle)
- Dashboard Home Page (Stats cards, Recent Orders, Popular Items)
- Responsive design check (Mobile + Desktop)
- Loading skeletons
- Toast notifications (Sonner)

**Milestone:** Professional looking Admin Dashboard shell ready.

---

### **Phase 4: Main Feature Pages (Day 7-10)**

**Priority Order:**

1. **Menu Management** (`/admin/menu`)
   - Dish Grid + Table view
   - Add/Edit/Delete modal
   - Image upload with preview

2. **Orders Management** (`/admin/orders`)
   - Orders list with filters
   - Order details modal
   - Status update (Pending → Confirmed → Delivered)

3. **Business Timings** (`/admin/timings`)
   - Weekly schedule form

4. **Knowledge Base** (`/admin/knowledge`)
   - Offers, Policies, FAQs

5. **RAG Documents** (`/admin/documents`)
   - Drag & Drop upload
   - Ingestion status
   - Re-index button

6. **Settings** (`/admin/settings`)

**Milestone:** All major admin features functional.

---

### **Phase 5: UI Polish & Animations (Day 11-12)**

- Framer Motion animations (page transitions, hover effects, modals)
- Micro-interactions
- Loading states improvement
- Error states
- Mobile responsiveness fine-tuning
- Final design review (Premium feel)

---

### **Phase 6: Testing & Optimization (Day 13-14)**

- Manual testing of all flows
- Auth flow testing (login → dashboard → logout)
- Form validation
- Performance check (Lighthouse)
- Code cleanup & TypeScript strict mode
- SEO basics for public pages

---

## 3. Recommended Daily Workflow

1. Morning: Task pick karo spec se
2. Development
3. Test locally
4. Commit with proper message
5. Evening: Review kya bana aur kya next hai

---

## 4. Important Tips

- Pehle **Phase 1 & 2** complete karo (Foundation strong hona chahiye)
- Reusable components banao (`DishCard`, `OrderCard`, `DataTable` etc.)
- Har page ke liye proper loading & error handling rakho
- Consistent naming convention follow karo
- Git use karo regularly

---
```

## Response snapshot

Generated the implementation plan for the RoyalBite frontend/admin feature, including technical context, constitution checks, research decisions, data model, OpenAPI contracts, quickstart validation guide, and Claude agent context update.

## Outcome

- ✅ Impact: Feature is planned and ready for task generation.
- 🧪 Tests: setup-plan script, Context7 documentation lookups, agent-context update, and placeholder/clarification scans completed.
- 📁 Files: plan.md, research.md, data-model.md, contracts/admin-openapi.yaml, quickstart.md, and CLAUDE.md updated.
- 🔁 Next prompts: Run /sp.tasks to generate dependency-ordered implementation tasks.
- 🧠 Reflection: Documentation-backed planning clarified Auth.js role protection and Next.js server-side authorization as critical security boundaries.

## Evaluation notes (flywheel)

- Failure modes observed: None blocking; a checklist file still contains the literal checklist item text "No [NEEDS CLARIFICATION] markers remain", which is intentional and not an unresolved marker.
- Graders run and results (PASS/FAIL): PASS - no unresolved plan placeholders; PASS - no unresolved clarification markers in plan artifacts; PASS - agent context update completed.
- Prompt variant (if applicable): slash-command plan workflow
- Next experiment (smallest change to try): Add automated OpenAPI validation once dependencies exist.
