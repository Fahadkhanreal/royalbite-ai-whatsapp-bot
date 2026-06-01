import type {
  BusinessTiming,
  DashboardSummary,
  KnowledgeEntry,
  MenuItem,
  Order,
  RagDocument,
  RestaurantSettings,
} from "@/types/domain"

const now = new Date("2026-01-01T00:00:00.000Z").toISOString()

export const menuItems: MenuItem[] = [
  {
    id: "menu_chicken_karahi",
    name: "Chicken Karahi",
    description: "Fresh karahi cooked with tomatoes, green chilies, and RoyalBite spices.",
    price: 1450,
    category: "Karahi",
    availability: "available",
    imageUrl: "",
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "menu_zinger_burger",
    name: "Crispy Zinger Burger",
    description: "Crispy chicken fillet with house sauce and fresh salad.",
    price: 650,
    category: "Burgers",
    availability: "available",
    imageUrl: "",
    sortOrder: 2,
    createdAt: now,
    updatedAt: now,
  },
]

export const businessTimings: BusinessTiming[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
].map((day, index) => ({
  id: `timing_${day.toLowerCase()}`,
  dayOfWeek: day,
  isOpen: true,
  opensAt: index === 5 || index === 6 ? "13:00" : "12:00",
  closesAt: "23:30",
  notes: "",
  updatedAt: now,
}))

export const knowledgeEntries: KnowledgeEntry[] = [
  {
    id: "knowledge_delivery",
    type: "policy",
    title: "Delivery Policy",
    content: "Delivery time depends on distance and order volume. Confirm estimated time before final order.",
    status: "published",
    updatedAt: now,
  },
]

export const ragDocuments: RagDocument[] = [
  {
    id: "doc_menu_policy",
    fileName: "royalbite-menu-policy.pdf",
    fileType: "application/pdf",
    sizeBytes: 245760,
    status: "indexed",
    uploadedBy: "admin_royalbite",
    uploadedAt: now,
    indexedAt: now,
  },
]

export const orders: Order[] = [
  {
    id: "RB-1001",
    customerName: "Ahmed Khan",
    customerPhone: "+923000000000",
    customerAddress: "Gulshan-e-Iqbal, Karachi",
    items: [{ menuItemId: "menu_chicken_karahi", name: "Chicken Karahi", quantity: 1, unitPrice: 1450 }],
    totalAmount: 1450,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  },
]

export const restaurantSettings: RestaurantSettings = {
  id: "settings_royalbite",
  restaurantName: "RoyalBite",
  description: "Premium Pakistani restaurant with a warm AI waiter experience.",
  phone: "+923000000000",
  address: "Karachi, Pakistan",
  brandColors: {
    primary: "#E11D48",
    secondary: "#F97316",
  },
  botTone: "Friendly Pakistani restaurant waiter using Roman Urdu and English.",
  updatedAt: now,
}

export async function listMenuItems() {
  return menuItems
}

export async function listPublicMenuItems() {
  return menuItems.filter((item) => item.availability === "available")
}

export async function listBusinessTimings() {
  return businessTimings
}

export async function listKnowledgeEntries() {
  return knowledgeEntries
}

export async function listRagDocuments() {
  return ragDocuments
}

export async function listOrders() {
  return orders
}

export async function getRestaurantSettings() {
  return restaurantSettings
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return {
    todayOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === "pending").length,
    recentOrders: orders.slice(0, 5),
    popularItems: menuItems.slice(0, 5),
    knowledgeStatus: {
      publishedEntries: knowledgeEntries.filter((entry) => entry.status === "published").length,
      indexedDocuments: ragDocuments.filter((document) => document.status === "indexed").length,
      failedDocuments: ragDocuments.filter((document) => document.status === "failed").length,
    },
  }
}
