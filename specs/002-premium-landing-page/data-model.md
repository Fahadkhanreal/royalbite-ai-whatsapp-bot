# Data Model: Premium Landing Page

**Date**: 2026-06-01  
**Feature**: Premium Public Website + Floating WhatsApp Chatbot  
**Branch**: 002-premium-landing-page

## Overview

This document defines the data entities and their relationships for the landing page. For MVP, all data is static/hardcoded in TypeScript constants. No database required.

---

## Entities

### 1. Restaurant

Represents the RoyalBite restaurant business.

**Fields**:
- 
ame: string - "RoyalBite"
- 	agline: string - "Fresh Pakistani & Continental Cuisine"
- description: string - Restaurant story and values
- established_year: number - 2018
- whatsapp_number: string - "+923001234567" (with country code)
- phone: string - Contact phone
- email: string - Contact email
- ddress: string - Physical location
- opening_hours: OpeningHours - Daily hours
- logo: string - URL to logo image
- hero_image: string - URL to hero background image

**Example**:
`	ypescript
const restaurant = {
  name: "RoyalBite",
  tagline: "Fresh Pakistani & Continental Cuisine",
  description: "Established in 2018, RoyalBite blends traditional Pakistani flavors with continental cuisine...",
  established_year: 2018,
  whatsapp_number: "+923001234567",
  phone: "+92-21-1234567",
  email: "info@royalbite.com",
  address: "123 Main Street, Karachi, Pakistan",
  opening_hours: {
    monday: { open: "11:00", close: "23:00" },
    // ... other days
  },
  logo: "/images/logo.png",
  hero_image: "/images/hero-bg.jpg",
}
`

---

### 2. Dish

Represents a menu item.

**Fields**:
- id: string - Unique identifier
- 
ame: string - Dish name (e.g., "Biryani")
- description: string - Short description
- price: number - Price in PKR
- category: "starters" | "main" | "bbq" | "desserts" | "beverages"
- image: string - URL to dish image
- vailable: boolean - Whether currently available
- 	ags: string[] - Optional tags (e.g., ["spicy", "vegetarian"])

**Example**:
`	ypescript
const dishes = [
  {
    id: "dish-001",
    name: "Chicken Biryani",
    description: "Fragrant basmati rice with tender chicken and aromatic spices",
    price: 450,
    category: "main",
    image: "/images/dishes/biryani.jpg",
    available: true,
    tags: ["spicy", "popular"],
  },
  // ... more dishes
]
`

---

### 3. Review

Represents a customer testimonial.

**Fields**:
- id: string - Unique identifier
- uthor_name: string - Customer name
- uthor_image: string - Optional customer photo URL
- ating: number - 1-5 stars
- 	ext: string - Review text
- erified: boolean - Whether customer is verified
- date: string - ISO date string

**Example**:
`	ypescript
const reviews = [
  {
    id: "review-001",
    author_name: "Ahmed Khan",
    author_image: "/images/reviews/ahmed.jpg",
    rating: 5,
    text: "Best biryani in Karachi! Highly recommended.",
    verified: true,
    date: "2026-05-15",
  },
  // ... more reviews
]
`

---

### 4. Reservation

Represents a table reservation request.

**Fields**:
- id: string - Unique identifier (generated on submit)
- customer_name: string - Full name
- phone: string - Contact phone
- date: string - ISO date string
- 	ime: string - Time in HH:MM format
- guest_count: number - Number of guests (1-20)
- special_requests: string - Optional special requests
- status: "pending" | "confirmed" | "cancelled"
- created_at: string - ISO timestamp

**Example**:
`	ypescript
const reservation = {
  id: "res-001",
  customer_name: "Fatima Ahmed",
  phone: "+923001234567",
  date: "2026-06-15",
  time: "19:00",
  guest_count: 4,
  special_requests: "Window seat preferred",
  status: "pending",
  created_at: "2026-06-01T20:30:00Z",
}
`

---

## Relationships

`
Restaurant (1) ──── (many) Dish
Restaurant (1) ──── (many) Review
Restaurant (1) ──── (many) Reservation
`

- One restaurant has many dishes
- One restaurant has many reviews
- One restaurant has many reservations

---

## Data Storage Strategy (MVP)

**Phase 1 (Current)**: All data hardcoded in TypeScript constants
- File: lib/constants.ts
- No database required
- Static content only

**Phase 2 (Future)**: Move to CMS or database
- Headless CMS (Contentful, Sanity)
- PostgreSQL with admin dashboard
- Real-time updates for menu, hours, etc.

---

## Validation Rules

### Dish
- 
ame: Required, min 2 chars, max 100 chars
- price: Required, positive number
- category: Required, must be one of predefined categories
- image: Required, valid URL

### Review
- uthor_name: Required, min 2 chars, max 50 chars
- ating: Required, integer 1-5
- 	ext: Required, min 10 chars, max 500 chars

### Reservation
- customer_name: Required, min 2 chars, max 100 chars
- phone: Required, valid phone format
- date: Required, must be future date
- 	ime: Required, valid HH:MM format
- guest_count: Required, integer 1-20

---

## Constants File Structure

`	ypescript
// lib/constants.ts

export const RESTAURANT = { /* ... */ }
export const DISHES = [ /* ... */ ]
export const REVIEWS = [ /* ... */ ]
export const WHATSAPP_NUMBER = "+923001234567"
export const OPENING_HOURS = { /* ... */ }
`

This structure allows easy updates and future migration to a database.
