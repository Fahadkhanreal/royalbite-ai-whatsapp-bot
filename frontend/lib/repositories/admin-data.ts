import type {
  BusinessTiming,
  DashboardSummary,
  KnowledgeEntry,
  MenuItem,
  Order,
  OrderItemSnapshot,
  RagDocument,
  RestaurantSettings,
} from "@/types/domain"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq, desc, and } from "drizzle-orm"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

// ─── Menu ───────────────────────────────────────────────────────────────

export async function listMenuItems(): Promise<MenuItem[]> {
  try {
    const rows = await db.query.dishes.findMany({
      orderBy: desc(schema.dishes.createdAt),
    })
    return (rows || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      description: d.description || "",
      price: parseFloat(d.price || 0),
      category: d.category || "General",
      availability: d.is_available ? "available" as const : "unavailable" as const,
      imageUrl: d.image_url || "",
      sortOrder: 0,
      createdAt: d.created_at || "",
      updatedAt: d.updated_at || "",
    }))
  } catch {
    return []
  }
}

export async function listPublicMenuItems(): Promise<MenuItem[]> {
  const items = await listMenuItems()
  return items.filter((item) => item.availability === "available")
}

// ─── Business Timings ───────────────────────────────────────────────────

export async function listBusinessTimings(): Promise<BusinessTiming[]> {
  try {
    const rows = await db.query.businessTimings.findMany({
      orderBy: schema.businessTimings.dayOfWeek,
    })
    return (rows || []).map((t: any) => ({
      id: t.id,
      dayOfWeek: DAY_NAMES[t.day_of_week] || "Unknown",
      isOpen: !t.is_holiday,
      opensAt: t.open_time?.slice(0, 5) || "11:00",
      closesAt: t.close_time?.slice(0, 5) || "22:00",
      notes: t.is_holiday ? "Closed" : "",
      updatedAt: t.updated_at || "",
    }))
  } catch {
    return []
  }
}

// ─── Knowledge Base ─────────────────────────────────────────────────────

export async function listKnowledgeEntries(): Promise<KnowledgeEntry[]> {
  try {
    const rows = await db.query.knowledgeBase.findMany({
      orderBy: desc(schema.knowledgeBase.createdAt),
    })
    return (rows || []).map((e: any) => ({
      id: e.id,
      type: (e.category || "general") as any,
      title: e.title,
      content: e.content,
      status: "published" as const,
      updatedAt: e.updated_at || "",
    }))
  } catch {
    return []
  }
}

// ─── RAG Documents ──────────────────────────────────────────────────────

export async function listRagDocuments(): Promise<RagDocument[]> {
  try {
    const rows = await db.query.documents.findMany({
      orderBy: desc(schema.documents.createdAt),
    })
    return (rows || []).map((d: any) => ({
      id: d.id,
      fileName: d.source || "document",
      fileType: (d.metadata?.type as string) || "text",
      sizeBytes: d.content?.length || 0,
      status: "indexed" as const,
      uploadedBy: d.created_by || "",
      uploadedAt: d.created_at || "",
      indexedAt: d.updated_at || "",
    }))
  } catch {
    return []
  }
}

// ─── Orders ─────────────────────────────────────────────────────────────

export async function listOrders(): Promise<Order[]> {
  try {
    const rows = await db.query.orders.findMany({
      orderBy: desc(schema.orders.createdAt),
      with: {
        items: {
          with: { dish: true },
        },
      },
    })
    return (rows || []).map((o: any) => ({
      id: o.id || "N/A",
      customerName: o.phone_number || "Unknown",
      customerPhone: o.phone_number || "",
      customerAddress: "",
      items: (o.items || []).map((i: any): OrderItemSnapshot => ({
        menuItemId: i.dish?.id || "",
        name: i.dish?.name || "Item",
        quantity: i.quantity || 1,
        unitPrice: parseFloat(i.price_at_order || i.dish?.price || 0),
      })),
      totalAmount: parseFloat(o.total_price || 0),
      status: o.status || "pending",
      createdAt: o.created_at || "",
      updatedAt: o.updated_at || "",
    }))
  } catch {
    return []
  }
}

// ─── Restaurant Settings ────────────────────────────────────────────────

export async function getRestaurantSettings(): Promise<RestaurantSettings> {
  try {
    const firstUser = await db.query.users.findFirst()
    return {
      id: "settings_royalbite",
      restaurantName: "RoyalBite",
      description: "Premium Pakistani restaurant with AI chatbot.",
      phone: "+923482240731",
      address: "Karachi, Pakistan",
      brandColors: { primary: "#C9A227", secondary: "#A67D1F" },
      botTone: "Friendly Pakistani restaurant waiter using Roman Urdu and English.",
      updatedAt: firstUser?.updated_at ? String(firstUser.updated_at) : new Date().toISOString(),
    }
  } catch {
    return {
      id: "settings_royalbite",
      restaurantName: "RoyalBite",
      description: "Premium Pakistani restaurant with AI chatbot.",
      phone: "+923482240731",
      address: "Karachi, Pakistan",
      brandColors: { primary: "#C9A227", secondary: "#A67D1F" },
      botTone: "Friendly Pakistani restaurant waiter using Roman Urdu and English.",
      updatedAt: new Date().toISOString(),
    }
  }
}

// ─── Dashboard Summary ──────────────────────────────────────────────────

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [orders, menuItems, knowledgeEntries] = await Promise.all([
    listOrders(),
    listMenuItems(),
    listKnowledgeEntries(),
  ])

  const today = new Date().toDateString()
  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === today
  )

  // Count dish popularity from orders
  const dishCount = new Map<string, number>()
  orders.forEach((o) =>
    o.items.forEach((i) => {
      dishCount.set(i.name, (dishCount.get(i.name) || 0) + i.quantity)
    })
  )
  const popularItems = [...dishCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => menuItems.find((m) => m.name === name))
    .filter(Boolean) as MenuItem[]

  return {
    todayOrders: todayOrders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    recentOrders: orders.slice(0, 5),
    popularItems: popularItems.length > 0 ? popularItems : menuItems.slice(0, 5),
    knowledgeStatus: {
      publishedEntries: knowledgeEntries.length,
      indexedDocuments: 0,
      failedDocuments: 0,
    },
  }
}
