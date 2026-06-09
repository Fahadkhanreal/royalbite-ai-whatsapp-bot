// Zod validation schemas for all API inputs
// Location: lib/validations/schemas.ts

import { z } from 'zod';

// ============================================
// COMMON SCHEMAS
// ============================================

export const uuidSchema = z.string().uuid('Invalid UUID format');
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');
export const emailSchema = z.string().email('Invalid email address');
export const priceSchema = z.number().positive('Price must be positive').max(999999.99);

// ============================================
// DISHES SCHEMAS
// ============================================

export const createDishSchema = z.object({
  name: z.string().min(1, 'Dish name is required').max(255),
  description: z.string().optional(),
  price: priceSchema,
  category: z.string().min(1, 'Category is required').max(100),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const updateDishSchema = createDishSchema.partial();

export const dishIdSchema = z.object({
  id: uuidSchema,
});

export type CreateDishInput = z.infer<typeof createDishSchema>;
export type UpdateDishInput = z.infer<typeof updateDishSchema>;

// ============================================
// ORDERS SCHEMAS
// ============================================

export const createOrderSchema = z.object({
  phoneNumber: phoneSchema,
  dishIds: z.array(uuidSchema).min(1, 'At least one dish is required'),
  specialInstructions: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'delivered', 'cancelled']),
});

export const orderFiltersSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'delivered', 'cancelled']).optional(),
  phoneNumber: phoneSchema.optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderFiltersInput = z.infer<typeof orderFiltersSchema>;

// ============================================
// MESSAGES SCHEMAS
// ============================================

export const whatsappMessageSchema = z.object({
  from: phoneSchema,
  body: z.string().min(1, 'Message cannot be empty').max(4096),
  messageId: z.string().optional(),
  timestamp: z.number().optional(),
});

export const chatMessageSchema = z.object({
  phoneNumber: phoneSchema,
  messageText: z.string().min(1).max(4096),
  messageType: z.enum(['text', 'image', 'audio', 'document']).default('text'),
  intent: z.string().optional(),
});

export type WhatsappMessageInput = z.infer<typeof whatsappMessageSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

// ============================================
// DOCUMENTS SCHEMAS
// ============================================

export const createDocumentSchema = z.object({
  content: z.string().min(1, 'Document content is required'),
  metadata: z.record(z.string(), z.any()).optional(),
  source: z.string().optional(),
  type: z.enum(['menu', 'faq', 'policy']).default('policy'),
});

export const searchDocumentsSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  limit: z.number().min(1).max(10).default(3),
  minSimilarity: z.number().min(0).max(1).default(0.5),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type SearchDocumentsInput = z.infer<typeof searchDocumentsSchema>;

// ============================================
// BUSINESS TIMINGS SCHEMAS
// ============================================

export const businessTimingSchema = z.object({
  dayOfWeek: z.number().min(0).max(6, 'Day must be 0-6 (0=Sunday)'),
  openTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Invalid time format (HH:MM:SS)'),
  closeTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Invalid time format (HH:MM:SS)'),
  isHoliday: z.boolean().default(false),
});

export type BusinessTimingInput = z.infer<typeof businessTimingSchema>;

// ============================================
// KNOWLEDGE BASE SCHEMAS
// ============================================

export const createKnowledgeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().min(1, 'Content is required'),
  category: z.string().max(100).optional(),
  source: z.string().max(255).optional(),
});

export const updateKnowledgeSchema = createKnowledgeSchema.partial();

export type CreateKnowledgeInput = z.infer<typeof createKnowledgeSchema>;
export type UpdateKnowledgeInput = z.infer<typeof updateKnowledgeSchema>;

// ============================================
// PAGINATION SCHEMAS
// ============================================

export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ============================================
// ADMIN / COMMON SCHEMAS (moved from admin.ts)
// ============================================

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const weeklyTimingsSchema = z.object({
  timings: z.array(businessTimingSchema).min(7, "Weekly timings must include all days"),
});

export const documentUploadSchema = z.object({
  fileName: z.string().trim().min(1, "File name is required"),
  fileType: z.string().trim().min(1, "File type is required"),
  sizeBytes: z.coerce.number().int().positive("File size must be positive"),
});

export const restaurantSettingsSchema = z.object({
  restaurantName: z.string().trim().min(1, "Restaurant name is required"),
  description: z.string().trim().default(""),
  phone: z.string().trim().min(1, "Phone number is required"),
  address: z.string().trim().min(1, "Address is required"),
  botTone: z.string().trim().min(1, "Bot tone is required"),
});

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type RestaurantSettingsInput = z.infer<typeof restaurantSettingsSchema>;
