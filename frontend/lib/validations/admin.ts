// Re-exports from unified schemas
// This file is kept for backward compatibility — all schemas now live in schemas.ts
// Import directly from "@/lib/validations/schemas" for new code

export {
  loginSchema,
  weeklyTimingsSchema,
  documentUploadSchema,
  restaurantSettingsSchema,
  createDishSchema as menuItemSchema,
  updateOrderStatusSchema as orderStatusSchema,
  createKnowledgeSchema as knowledgeEntrySchema,
  businessTimingSchema,
} from "./schemas"

export type {
  LoginInput,
  CreateDishInput as MenuItemInput,
  UpdateOrderStatusInput as OrderStatusInput,
  CreateKnowledgeInput as KnowledgeEntryInput,
  DocumentUploadInput,
  RestaurantSettingsInput,
} from "./schemas"
