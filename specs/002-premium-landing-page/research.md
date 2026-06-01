# Research & Technical Findings: Premium Landing Page

**Date**: 2026-06-01  
**Feature**: Premium Public Website + Floating WhatsApp Chatbot  
**Branch**: 002-premium-landing-page

## Research Summary

This document consolidates findings from Phase 0 research tasks. All technical unknowns have been resolved and best practices documented.

---

## 1. Tailwind CSS v4 with Next.js 16

**Decision**: Use Tailwind CSS v4 with PostCSS plugin and custom theme configuration.

**Rationale**: 
- Tailwind v4 is the latest stable version with improved performance
- Next.js 16 has native support via PostCSS
- Custom theme colors (Royal Spice palette) defined as CSS variables in globals.css
- Supports dark mode via class strategy

**Implementation**:

`	ypescript
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#9F1239",      // Deep Maroon
        secondary: "#EA580C",    // Warm Orange
        accent: "#22C55E",       // Fresh Green
      },
    },
  },
}

export default config
`

`css
/* app/globals.css */
@import "tailwindcss";

:root {
  --primary: #9F1239;
  --secondary: #EA580C;
  --accent: #22C55E;
  --dark: #0A0A0A;
  --light: #FAF9F6;
}

.dark {
  --background: #0A0A0A;
  --foreground: #FAF9F6;
}
`

**Alternatives Considered**: 
- CSS Modules: Less flexible for theming
- Styled Components: Overkill for static landing page

---

## 2. Framer Motion Animations

**Decision**: Use Framer Motion for scroll-triggered animations with useInView hook for performance.

**Rationale**:
- Framer Motion is battle-tested for React animations
- useInView hook prevents rendering off-screen animations
- Supports parallax, fade-in, slide-up effects natively
- Performance optimized with GPU acceleration

**Implementation Pattern**:

`	ypescript
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

export function AnimatedSection() {
  const { ref, inView } = useInView({ threshold: 0.1 })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      Content
    </motion.div>
  )
}
`

**Alternatives Considered**:
- CSS animations: Limited interactivity
- React Spring: More complex API

---

## 3. shadcn/ui Component Library

**Decision**: Use shadcn/ui for pre-built, accessible components.

**Rationale**:
- All required components available: Button, Card, Badge, Dialog, Form, Input, Select
- Built on Radix UI (accessible primitives)
- Fully customizable with Tailwind
- No external dependencies beyond React

**Required Components**:

- Button: CTA buttons, form submission
- Card: Dish cards, testimonial cards, why-choose-us cards
- Badge: "Verified Customer" badges on reviews
- Dialog: Lightbox for gallery images
- Form: Reservation form with validation
- Input: Text, email, phone, date/time inputs
- Select: Guest count dropdown

**Installation**:

`ash
npx shadcn-ui@latest add button card badge dialog form input select
`

**Alternatives Considered**:
- Material-UI: Too heavy, not customizable enough
- Chakra UI: Good but requires additional setup

---

## 4. React Hook Form + Zod Validation

**Decision**: Use React Hook Form for form state + Zod for schema validation.

**Rationale**:
- React Hook Form: Minimal re-renders, excellent performance
- Zod: Type-safe schema validation, great DX
- Works seamlessly with shadcn/ui Form component
- Client-side validation only for MVP (no backend)

**Implementation Pattern**:

`	ypescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const reservationSchema = z.object({
  name: z.string().min(2, "Name required"),
  phone: z.string().regex(/^\+?[0-9]{10,}/, "Valid phone required"),
  date: z.string().refine(d => new Date(d) > new Date(), "Future date required"),
  guests: z.number().min(1).max(20),
})

type ReservationForm = z.infer<typeof reservationSchema>

export function ReservationForm() {
  const form = useForm<ReservationForm>({
    resolver: zodResolver(reservationSchema),
  })
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
`

**Alternatives Considered**:
- Formik: More boilerplate
- Manual validation: Error-prone

---

## 5. Image Optimization

**Decision**: Use Next.js Image component with lazy loading and responsive sizes.

**Rationale**:
- Next.js Image: Automatic optimization, WebP conversion, responsive sizing
- loading="lazy": Defers off-screen image loading
- sizes prop: Serves correct image size per viewport
- Reduces initial page load time

**Implementation Pattern**:

`	ypescript
import Image from "next/image"

export function DishCard({ image, name }: Props) {
  return (
    <Image
      src={image}
      alt={name}
      width={400}
      height={300}
      loading="lazy"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover rounded-lg"
    />
  )
}
`

**Alternatives Considered**:
- HTML img tag: No optimization
- Cloudinary: External dependency

---

## 6. WhatsApp Web API

**Decision**: Use WhatsApp Web API with pre-filled messages and web.whatsapp.com fallback.

**Rationale**:
- WhatsApp Web API: Works on all devices (mobile + desktop)
- Pre-filled messages: Better UX, reduces friction
- web.whatsapp.com: Fallback for web clients without WhatsApp app
- No authentication required

**Message Format**:

`
https://wa.me/{PHONE_NUMBER}?text={URL_ENCODED_MESSAGE}

Examples:
- Order: https://wa.me/923001234567?text=Hi%2C%20I%27d%20like%20to%20order%20Biryani
- Reservation: https://wa.me/923001234567?text=I%27d%20like%20to%20reserve%20a%20table%20for%204%20people
`

**Implementation**:

`	ypescript
const WHATSAPP_NUMBER = "923001234567" // Pakistan country code
const message = encodeURIComponent("Hi, I'd like to order...")
const whatsappLink = https://wa.me/?text=

export function WhatsAppButton() {
  return <a href={whatsappLink} target="_blank">Order on WhatsApp</a>
}
`

**Alternatives Considered**:
- WhatsApp Business API: Requires authentication, overkill for MVP
- Email: Less immediate than WhatsApp

---

## 7. SEO & Meta Tags

**Decision**: Use Next.js Metadata API with Open Graph tags and structured data.

**Rationale**:
- Next.js Metadata API: Type-safe, built-in support
- Open Graph: Better social media sharing
- Structured data (JSON-LD): Improves search visibility
- No external SEO tools needed

**Implementation**:

`	ypescript
// app/layout.tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "RoyalBite - Premium Pakistani Restaurant",
  description: "Experience authentic Pakistani & Continental cuisine in Karachi",
  openGraph: {
    title: "RoyalBite",
    description: "Premium Pakistani Restaurant",
    url: "https://royalbite.com",
    siteName: "RoyalBite",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoyalBite",
    description: "Premium Pakistani Restaurant",
    images: ["/og-image.jpg"],
  },
}
`

**Alternatives Considered**:
- Manual meta tags: Error-prone, not type-safe
- Third-party SEO tools: Unnecessary for static content

---

## Conclusion

All technical unknowns resolved. Ready for Phase 1 design and Phase 2 task breakdown.
