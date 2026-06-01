# Quickstart Guide: Premium Landing Page

**Date**: 2026-06-01  
**Feature**: Premium Public Website + Floating WhatsApp Chatbot  
**Branch**: 002-premium-landing-page

## Quick Setup (5 minutes)

### 1. Install Dependencies

`ash
cd frontend
npm install framer-motion lucide-react
npm run dev
`

### 2. Verify Tailwind & Fonts

Check that 	ailwind.config.ts and pp/globals.css are properly configured with Royal Spice theme colors.

### 3. Create Constants File

Create lib/constants.ts with restaurant data:

`	ypescript
export const WHATSAPP_NUMBER = "+923001234567"

export const RESTAURANT = {
  name: "RoyalBite",
  tagline: "Fresh Pakistani & Continental Cuisine",
  description: "Established in 2018...",
  established_year: 2018,
  phone: "+92-21-1234567",
  email: "info@royalbite.com",
  address: "123 Main Street, Karachi",
}

export const DISHES = [
  {
    id: "dish-001",
    name: "Chicken Biryani",
    description: "Fragrant basmati rice with tender chicken",
    price: 450,
    category: "main",
    image: "/images/dishes/biryani.jpg",
    available: true,
  },
  // ... more dishes
]

export const REVIEWS = [
  {
    id: "review-001",
    author_name: "Ahmed Khan",
    rating: 5,
    text: "Best biryani in Karachi!",
    verified: true,
    date: "2026-05-15",
  },
  // ... more reviews
]
`

### 4. Create Animation Config

Create lib/animations.ts:

`	ypescript
import { Variants } from "framer-motion"

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
}
`

---

## Component Structure

### Core Components to Create

#### 1. Navbar (components/common/navbar.tsx)

`	ypescript
"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-red-500">
          🍽️ RoyalBite
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="#menu" className="text-slate-300 hover:text-white">Menu</Link>
          <Link href="#about" className="text-slate-300 hover:text-white">About</Link>
          <Link href="#gallery" className="text-slate-300 hover:text-white">Gallery</Link>
          <Button className="bg-green-500 text-white hover:bg-green-600">
            Order on WhatsApp
          </Button>
        </div>
        <Menu className="md:hidden text-slate-300" />
      </div>
    </nav>
  )
}
`

#### 2. Hero Section (components/sections/hero-section.tsx)

`	ypescript
"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { fadeInUp } from "@/lib/animations"

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
      <motion.div
        className="text-center space-y-6 max-w-3xl"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-5xl md:text-7xl font-bold text-slate-100">
          Assalamualaikum bhai, <span className="text-red-500">RoyalBite</span> ready hai.
        </h1>
        <p className="text-xl text-slate-400">
          Experience unforgettable flavors in Karachi
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-red-600 hover:bg-red-700">
            Order Now on WhatsApp
          </Button>
          <Button size="lg" variant="outline" className="border-slate-600">
            Reserve Table
          </Button>
        </div>
      </motion.div>
    </section>
  )
}
`

#### 3. Featured Dishes (components/sections/featured-dishes.tsx)

`	ypescript
"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DISHES } from "@/lib/constants"

export function FeaturedDishes() {
  return (
    <section className="py-20 px-6 bg-slate-800/50">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-4xl font-bold text-slate-100 mb-12 text-center">
          Our Signature Dishes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DISHES.slice(0, 6).map((dish) => (
            <Card key={dish.id} className="border-slate-700 bg-slate-900">
              <CardContent className="p-0">
                <Image
                  src={dish.image}
                  alt={dish.name}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover rounded-t-lg"
                  loading="lazy"
                />
                <div className="p-4 space-y-3">
                  <h3 className="text-xl font-semibold text-slate-100">{dish.name}</h3>
                  <p className="text-slate-400 text-sm">{dish.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-red-500 font-bold">Rs. {dish.price}</span>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600">
                      Add to Order
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
`

---

## File Creation Checklist

- [ ] lib/constants.ts - Restaurant data
- [ ] lib/animations.ts - Framer Motion configs
- [ ] components/common/navbar.tsx
- [ ] components/sections/hero-section.tsx
- [ ] components/sections/featured-dishes.tsx
- [ ] components/sections/about-us.tsx
- [ ] components/sections/why-choose-us.tsx
- [ ] components/sections/menu-preview.tsx
- [ ] components/sections/gallery.tsx
- [ ] components/sections/testimonials.tsx
- [ ] components/sections/reservation.tsx
- [ ] components/sections/contact-section.tsx
- [ ] components/common/footer.tsx
- [ ] components/common/floating-whatsapp-button.tsx

---

## Testing Checklist

- [ ] Page loads in < 3 seconds
- [ ] All sections render correctly
- [ ] Animations are smooth (60 FPS)
- [ ] Mobile responsive (320px+)
- [ ] WhatsApp buttons work
- [ ] Images load with lazy loading
- [ ] Lighthouse score 90+
- [ ] WCAG AA accessibility

---

## Next Steps

1. Run /sp.tasks to generate detailed task breakdown
2. Start with Navbar + Hero section (P0)
3. Follow task priority order
4. Test each section before moving to next
