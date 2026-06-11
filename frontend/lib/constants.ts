export const APP_NAME = "RoyalBite AI"

export const ROYALBITE_COLORS = {
  primary: "#C9A227",     // Gold (brand)
  secondary: "#B8860B",   // Dark Goldenrod
  darkBackground: "#0A0A0A",
  gold: "#C9A227",
} as const

export const ADMIN_NAV_ITEMS = [
  { title: "Dashboard", href: "/admin/dashboard" },
  { title: "Menu", href: "/admin/menu" },
  { title: "Orders", href: "/admin/orders" },
  { title: "Timings", href: "/admin/timings" },
  { title: "Knowledge", href: "/admin/knowledge" },
  { title: "Documents", href: "/admin/documents" },
  { title: "Analytics", href: "/admin/analytics" },
  { title: "Settings", href: "/admin/settings" },
] as const

export const PUBLIC_NAV_ITEMS = [
  { title: "Home", href: "/" },
  { title: "Menu", href: "/menu" },
  { title: "About", href: "/about" },
] as const

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+923181215427"

export const DISHES = [
  {
    id: 1,
    name: "Biryani Royale",
    price: "Rs. 450",
    description: "Fragrant basmati rice with tender meat and aromatic spices",
    image: "/dishes/biryani.jpg",
  },
  {
    id: 2,
    name: "Karahi Chicken",
    price: "Rs. 380",
    description: "Succulent chicken cooked in traditional karahi with fresh herbs",
    image: "/dishes/karahi.jpg",
  },
  {
    id: 3,
    name: "Seekh Kebab",
    price: "Rs. 320",
    description: "Minced meat kebabs grilled to perfection with spices",
    image: "/dishes/seekh-kebab.jpg",
  },
  {
    id: 4,
    name: "Nihari",
    price: "Rs. 400",
    description: "Slow-cooked meat stew with rich, aromatic gravy",
    image: "/dishes/nihari.jpg",
  },
  {
    id: 5,
    name: "Tikka Masala",
    price: "Rs. 420",
    description: "Tender chicken tikka in creamy tomato-based sauce",
    image: "/dishes/tikka-masala.jpg",
  },
  {
    id: 6,
    name: "Haleem",
    price: "Rs. 350",
    description: "Traditional slow-cooked meat and lentil delicacy",
    image: "/dishes/haleem.jpg",
  },
]

export const REVIEWS = [
  {
    id: 1,
    name: "Ahmed Hassan",
    rating: 5,
    text: "Best biryani I've ever had! The quality and taste are exceptional. Highly recommend RoyalBite.",
    verified: true,
  },
  {
    id: 2,
    name: "Fatima Khan",
    rating: 5,
    text: "Amazing service and delicious food. The WhatsApp ordering is so convenient. Will order again!",
    verified: true,
  },
  {
    id: 3,
    name: "Hassan Ali",
    rating: 5,
    text: "Authentic Pakistani cuisine at its finest. Every dish is prepared with care and passion.",
    verified: true,
  },
  {
    id: 4,
    name: "Zainab Malik",
    rating: 5,
    text: "The karahi chicken is absolutely delicious. Fresh ingredients and perfect seasoning every time.",
    verified: true,
  },
  {
    id: 5,
    name: "Muhammad Saeed",
    rating: 5,
    text: "Excellent quality and fast delivery. RoyalBite has become my go-to restaurant for special occasions.",
    verified: true,
  },
]
