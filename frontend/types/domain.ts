export type AdminRole = "admin"
export type AdminStatus = "active" | "disabled"

export interface AdminUser {
  id: string
  name: string
  email: string
  passwordHash: string
  role: AdminRole
  status: AdminStatus
  createdAt: string
  updatedAt: string
}

export interface AdminSessionUser {
  id: string
  name: string
  email: string
  role: AdminRole
}

export type MenuItemAvailability = "available" | "unavailable" | "draft"

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  availability: MenuItemAvailability
  imageUrl?: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface BusinessTiming {
  id: string
  dayOfWeek: string
  isOpen: boolean
  opensAt?: string
  closesAt?: string
  notes?: string
  updatedAt: string
}

export type KnowledgeEntryType = "offer" | "policy" | "faq" | "general"
export type KnowledgeEntryStatus = "draft" | "published" | "archived"

export interface KnowledgeEntry {
  id: string
  type: KnowledgeEntryType
  title: string
  content: string
  status: KnowledgeEntryStatus
  updatedAt: string
}

export type RagDocumentStatus = "uploaded" | "processing" | "indexed" | "failed"

export interface RagDocument {
  id: string
  fileName: string
  fileType: string
  sizeBytes: number
  status: RagDocumentStatus
  failureReason?: string
  uploadedBy: string
  uploadedAt: string
  indexedAt?: string
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled"

export interface OrderItemSnapshot {
  menuItemId: string
  name: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  customerName: string
  customerPhone: string
  customerAddress?: string
  items: OrderItemSnapshot[]
  totalAmount: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

export interface RestaurantSettings {
  id: string
  restaurantName: string
  description: string
  phone: string
  address: string
  brandColors?: Record<string, string>
  botTone: string
  updatedAt: string
}

export interface DashboardSummary {
  todayOrders: number
  pendingOrders: number
  recentOrders: Order[]
  popularItems: MenuItem[]
  knowledgeStatus: {
    publishedEntries: number
    indexedDocuments: number
    failedDocuments: number
  }
}
