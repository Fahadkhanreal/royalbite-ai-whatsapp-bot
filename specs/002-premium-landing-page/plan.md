# Implementation Plan: Premium Public Website + Floating WhatsApp Chatbot

**Branch**: `002-premium-landing-page` | **Date**: 2026-06-01 | **Spec**: [specs/002-premium-landing-page/spec.md](spec.md)
**Input**: Feature specification from `/specs/002-premium-landing-page/spec.md`

## Summary

Build a premium, dark-themed landing page for RoyalBite restaurant with "Royal Spice" design system. Core features: sticky navbar, full-screen hero, featured dishes cards, about/why-choose-us sections, gallery with masonry layout, customer reviews, reservation form, and floating WhatsApp button for direct ordering. All sections include smooth animations (Framer Motion), responsive mobile-first design, and WhatsApp integration for seamless order placement.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16.2.6, React 19.2.4  
**Primary Dependencies**: Tailwind CSS 4, shadcn/ui, Framer Motion 12.40.0, Lucide React 1.17.0, React Hook Form 7.77.0, Zod 4.4.3  
**Storage**: N/A (static landing page, no backend data persistence for MVP)  
**Testing**: Manual browser testing, Lighthouse audit, responsive design testing  
**Target Platform**: Web (desktop, tablet, mobile browsers)  
**Project Type**: Web application (Next.js frontend)  
**Performance Goals**: Page load < 3 seconds (4G), Lighthouse score 90+, 60 FPS animations, Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1  
**Constraints**: Mobile-first responsive design (320px+), WCAG AA accessibility compliance, dark theme primary, WhatsApp integration must work on all devices  
**Scale/Scope**: Single landing page with 11 sections, ~2000 lines of component code, 50+ reusable components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Accuracy**: Landing page displays static restaurant info (name, story, menu categories, contact). No dynamic data required for MVP.  
✅ **Experience**: WhatsApp buttons use warm, friendly messaging. Hero section conveys premium Pakistani restaurant experience.  
✅ **Order Integrity**: WhatsApp links pre-fill messages; no order processing on website (handled by WhatsApp).  
✅ **Privacy/Security**: No customer data collected on landing page. Reservation form (if implemented) would need backend validation.  
✅ **Admin Knowledge**: Menu items, images, contact info are static for MVP. Can be made dynamic later via CMS.  
✅ **Reliability/Voice**: WhatsApp links use standard web.whatsapp.com fallback for web clients.

## Project Structure

### Documentation (this feature)

```text
specs/002-premium-landing-page/
├── spec.md                    # Feature specification
├── plan.md                    # This file (implementation plan)
├── research.md                # Phase 0 research findings
├── data-model.md              # Phase 1 data model
├── quickstart.md              # Phase 1 quickstart guide
├── contracts/                 # Phase 1 API contracts
│   └── whatsapp-links.md
├── checklists/
│   └── requirements.md        # Quality checklist
└── tasks.md                   # Phase 2 tasks (created by /sp.tasks)
```

### Source Code Structure

```text
frontend/
├── app/
│   ├── layout.tsx             # Root layout with providers
│   ├── page.tsx               # Landing page (main)
│   ├── globals.css            # Global styles + design tokens
│   ├── (auth)/                # Auth pages (existing)
│   ├── admin/                 # Admin pages (existing)
│   ├── menu/                  # Menu page (existing)
│   └── api/                   # API routes (existing)
├── components/
│   ├── common/
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── floating-whatsapp-button.tsx
│   │   └── app-providers.tsx
│   ├── sections/
│   │   ├── hero-section.tsx
│   │   ├── featured-dishes.tsx
│   │   ├── about-us.tsx
│   │   ├── why-choose-us.tsx
│   │   ├── menu-preview.tsx
│   │   ├── gallery.tsx
│   │   ├── testimonials.tsx
│   │   ├── reservation.tsx
│   │   └── contact-section.tsx
│   └── ui/                    # shadcn/ui components (existing)
├── lib/
│   ├── constants.ts           # App constants (WHATSAPP_NUMBER, etc.)
│   ├── utils.ts               # Utility functions
│   └── animations.ts          # Framer Motion animation configs
├── hooks/
│   └── use-scroll-animation.ts
├── public/
│   ├── images/
│   │   ├── hero-bg.jpg
│   │   ├── dishes/
│   │   ├── gallery/
│   │   └── team/
│   └── fonts/                 # Playfair Display (if self-hosted)
├── tailwind.config.ts         # Tailwind config with Royal Spice theme
├── next.config.ts
├── tsconfig.json
└── package.json
```

**Structure Decision**: Web application (Next.js frontend). Landing page is single-page with multiple sections. All components are in `frontend/` directory. Reuses existing shadcn/ui setup and Tailwind configuration.

## Complexity Tracking

No Constitution Check violations. All requirements align with project principles.

---

## Phase 0: Research & Unknowns Resolution

**Objective**: Resolve any technical unknowns and document best practices.

**Research Tasks**:

1. ✅ **Tailwind CSS v4 with Next.js 16**: Verify configuration, custom theme setup, and CSS variable integration
2. ✅ **Framer Motion animations**: Best practices for scroll-triggered animations, performance optimization
3. ✅ **shadcn/ui component library**: Verify component availability (Button, Card, Badge, Dialog, Form)
4. ✅ **React Hook Form + Zod**: Form validation patterns for reservation form
5. ✅ **Image optimization**: Next.js Image component, lazy loading, responsive images
6. ✅ **WhatsApp Web API**: Pre-filled message format, web.whatsapp.com fallback
7. ✅ **SEO & Meta tags**: Next.js metadata API, Open Graph tags, structured data

**Findings** (documented in `research.md`):

- Tailwind v4 uses CSS variables; custom theme colors defined in globals.css
- Framer Motion scroll animations use `useInView` hook for performance
- shadcn/ui provides all required components; install via CLI
- React Hook Form + Zod for client-side validation; server validation deferred to backend
- Next.js Image component with `loading="lazy"` for gallery images
- WhatsApp links: `https://wa.me/PHONE_NUMBER?text=MESSAGE` (URL-encoded)
- Next.js Metadata API for SEO; use `generateMetadata()` in layout.tsx

---

## Phase 1: Design & Contracts

**Objective**: Define data model, API contracts, and component architecture.

### 1.1 Data Model (`data-model.md`)

**Entities**:

- **Restaurant**: name, logo, tagline, story, established_year, contact_info, whatsapp_number, opening_hours
- **Dish**: id, name, description, price, category, image_url, available
- **Review**: id, author_name, rating (1-5), text, verified, date
- **Reservation**: id, customer_name, phone, date, time, guest_count, special_requests, status

**No database required for MVP** — all data is static/hardcoded in constants.

### 1.2 Component Architecture

**Layout Hierarchy**:

```
RootLayout (app/layout.tsx)
├── AppProviders (Tailwind, Framer Motion, Toaster)
└── Home (app/page.tsx)
    ├── Navbar
    ├── HeroSection
    ├── FeaturedDishes
    ├── AboutUs
    ├── WhyChooseUs
    ├── MenuPreview
    ├── Gallery
    ├── Testimonials
    ├── Reservation
    ├── ContactSection
    ├── Footer
    └── FloatingWhatsAppButton
```

### 1.3 API Contracts

**WhatsApp Integration**:

```
GET https://wa.me/{PHONE_NUMBER}?text={MESSAGE}

Examples:
- Order: "Hi, I'd like to order Biryani"
- Reservation: "I'd like to reserve a table for 4 people on Saturday at 7 PM"
```

**No backend API required for MVP** — all links are client-side.

### 1.4 Quickstart Guide (`quickstart.md`)

**Setup**:

```bash
cd frontend
npm install framer-motion lucide-react
npm run dev
```

**Key Files to Create**:

- `components/sections/hero-section.tsx`
- `components/sections/featured-dishes.tsx`
- `components/sections/gallery.tsx`
- `lib/constants.ts` (restaurant data, WhatsApp number)
- `lib/animations.ts` (Framer Motion configs)

---

## Phase 2: Task Breakdown

**Objective**: Generate actionable tasks for implementation.

**Output**: `tasks.md` (created by `/sp.tasks` command)

**Recommended Task Order** (from user input):

1. Navbar + Hero (P0 - foundation)
2. Featured Dishes (P1 - core content)
3. Floating WhatsApp Button (P1 - conversion)
4. Why Choose Us + Menu Preview (P2 - trust)
5. Gallery + Testimonials (P2 - social proof)
6. Reservation + Contact + Footer (P3 - nice-to-have)
7. Polish, animations, optimization (P4 - refinement)
8. Testing & final review (P5 - validation)
