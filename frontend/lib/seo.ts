// SEO constants and utilities for RoyalBite
// Centralized SEO configuration

export const SITE_CONFIG = {
  name: "RoyalBite",
  tagline: "Premium Pakistani Restaurant",
  description:
    "Experience authentic Pakistani & Continental cuisine at RoyalBite. Premium WhatsApp ordering, verified menu, and warm hospitality in Karachi.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://royalbite.vercel.app",
  locale: "en_PK",
  localeAlternate: "ur_PK",
  region: "PK",
  country: "Pakistan",
  city: "Karachi",
  address: "Karachi, Pakistan",
  phone: "+923482240731",
  email: "admin@royalbite.com",
  whatsapp: "+923482240731",
  currency: "PKR",
  priceRange: "₨₨",
  cuisine: ["Pakistani", "Continental", "BBQ", "Desi"],
  openingHours: {
    weekdays: "11:00-23:00",
    weekends: "11:00-00:00",
  },
  keywords: [
    "Pakistani restaurant",
    "Karachi food",
    "restaurant in Karachi",
    "WhatsApp ordering",
    "biryani",
    "chicken karahi",
    "continental cuisine",
    "premium dining",
    "RoyalBite",
    "best restaurant Karachi",
    "Pakistani BBQ",
    "food delivery Karachi",
    "online order Karachi",
  ],
  social: {
    facebook: "https://facebook.com/royalbitepk",
    instagram: "https://instagram.com/royalbitepk",
    twitter: "https://twitter.com/royalbitepk",
  },
  googleSiteVerification: "", // Add your Google Search Console verification code
} as const;

// Generate breadcrumb structured data
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Generate Restaurant structured data (JSON-LD)
export function restaurantSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "RoyalBite",
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    telephone: SITE_CONFIG.phone,
    servesCuisine: SITE_CONFIG.cuisine.join(", "),
    priceRange: SITE_CONFIG.priceRange,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE_CONFIG.city,
      addressCountry: SITE_CONFIG.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "24.8607",
      longitude: "67.0011",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "11:00",
        closes: "23:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: "11:00",
        closes: "00:00",
      },
    ],
    hasMenu: `${SITE_CONFIG.url}/menu`,
    acceptsReservations: "Yes",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      bestRating: "5",
      ratingCount: "150",
    },
  };
}
