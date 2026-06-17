import { pgTable, uuid, varchar, text, decimal, boolean, timestamp, jsonb, integer, pgEnum, index, customType } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Custom vector type since pgvector/drizzle-orm not available in this version
const vector = customType<{ data: number[]; driverData: string; config: { dimensions: number } }>({
  dataType: (config) => `vector(${config?.dimensions ?? 768})`,
  fromDriver: (value: string) => JSON.parse(value),
  toDriver: (value: number[]) => JSON.stringify(value),
});

// ============================================
// ENUMS
// ============================================

export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled']);
export const userRoleEnum = pgEnum('user_role', ['admin', 'customer']);

// ============================================
// USERS TABLE
// ============================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  role: userRoleEnum('role').default('admin'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
}));

// ============================================
// DISHES TABLE
// ============================================

export const dishes = pgTable('dishes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: varchar('category', { length: 100 }),
  imageUrl: varchar('image_url', { length: 500 }),
  isAvailable: boolean('is_available').default(true),
  isFeatured: boolean('is_featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  categoryIdx: index('idx_dishes_category').on(table.category),
  availableIdx: index('idx_dishes_available').on(table.isAvailable),
  featuredIdx: index('idx_dishes_featured').on(table.isFeatured),
}));

// ============================================
// ORDERS TABLE
// ============================================

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum('status').default('pending'),
  specialInstructions: text('special_instructions'),
  createdAt: timestamp('created_at').defaultNow(),
  confirmedAt: timestamp('confirmed_at'),
  deliveredAt: timestamp('delivered_at'),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  phoneIdx: index('idx_orders_phone').on(table.phoneNumber),
  statusIdx: index('idx_orders_status').on(table.status),
  createdIdx: index('idx_orders_created').on(table.createdAt),
}));

// ============================================
// ORDER_ITEMS TABLE
// ============================================

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  dishId: uuid('dish_id').notNull().references(() => dishes.id),
  quantity: integer('quantity').default(1),
  priceAtOrder: decimal('price_at_order', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  orderIdIdx: index('idx_order_items_order_id').on(table.orderId),
  dishIdIdx: index('idx_order_items_dish_id').on(table.dishId),
}));

// ============================================
// BUSINESS_TIMINGS TABLE
// ============================================

export const businessTimings = pgTable('business_timings', {
  id: uuid('id').primaryKey().defaultRandom(),
  dayOfWeek: integer('day_of_week').notNull(),
  openTime: varchar('open_time', { length: 8 }).notNull(),
  closeTime: varchar('close_time', { length: 8 }).notNull(),
  isHoliday: boolean('is_holiday').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// KNOWLEDGE_BASE TABLE
// ============================================

export const knowledgeBase = pgTable('knowledge_base', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }),
  source: varchar('source', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  categoryIdx: index('idx_knowledge_category').on(table.category),
}));

// ============================================
// DOCUMENTS TABLE (RAG Vector Store)
// ============================================

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 768 }).notNull(),
  metadata: jsonb('metadata'),
  source: varchar('source', { length: 255 }),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  embeddingIdx: index('idx_documents_embedding').on(table.embedding),
}));

// ============================================
// CHAT_LOGS TABLE
// ============================================

export const chatLogs = pgTable('chat_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  messageText: text('message_text').notNull(),
  messageType: varchar('message_type', { length: 20 }),
  intent: varchar('intent', { length: 50 }),
  responseText: text('response_text'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  phoneIdx: index('idx_chat_logs_phone').on(table.phoneNumber),
  createdIdx: index('idx_chat_logs_created').on(table.createdAt),
}));

// ============================================
// GALLERY_IMAGES TABLE
// ============================================

export const galleryImages = pgTable('gallery_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  src: varchar('src', { length: 500 }).notNull(),
  alt: varchar('alt', { length: 255 }).notNull(),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  sortOrderIdx: index('idx_gallery_sort_order').on(table.sortOrder),
}));

// ============================================
// REVIEWS TABLE
// ============================================

export const reviewStatusEnum = pgEnum('review_status', ['pending', 'approved', 'rejected']);

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  rating: integer('rating').notNull(),
  text: text('text').notNull(),
  status: reviewStatusEnum('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  statusIdx: index('idx_reviews_status').on(table.status),
}));

// ============================================
// SESSIONS TABLE
// ============================================

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_sessions_user_id').on(table.userId),
  tokenIdx: index('idx_sessions_token').on(table.token),
}));

// ============================================
// PROCESSED_WEBHOOKS TABLE (Message Deduplication)
// ============================================

export const processedWebhooks = pgTable('processed_webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  messageId: varchar('message_id', { length: 500 }).notNull().unique(),
  phoneNumber: varchar('phone_number', { length: 50 }),
  messagePreview: text('message_preview'),
  processedAt: timestamp('processed_at').defaultNow().notNull(),
}, (table) => ({
  messageIdIdx: index('idx_processed_webhooks_message_id').on(table.messageId),
  processedAtIdx: index('idx_processed_webhooks_processed_at').on(table.processedAt),
}));

// ============================================
// RELATIONS
// ============================================

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  dish: one(dishes, { fields: [orderItems.dishId], references: [dishes.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  sessions: many(sessions),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  creator: one(users, { fields: [documents.createdBy], references: [users.id] }),
}));
