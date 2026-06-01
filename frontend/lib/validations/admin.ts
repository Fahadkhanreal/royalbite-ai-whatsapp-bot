import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const menuItemSchema = z.object({
  name: z.string().trim().min(1, "Dish name is required"),
  description: z.string().trim().default(""),
  price: z.coerce.number().min(0, "Price must be zero or greater"),
  category: z.string().trim().min(1, "Category is required"),
  availability: z.enum(["available", "unavailable", "draft"]).default("available"),
  imageUrl: z.string().url("Image must be a valid URL").optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).default(0),
})

export const businessTimingSchema = z
  .object({
    dayOfWeek: z.string().trim().min(1, "Day is required"),
    isOpen: z.boolean(),
    opensAt: z.string().optional(),
    closesAt: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((value) => !value.isOpen || (value.opensAt && value.closesAt), {
    message: "Open days require opening and closing times",
    path: ["opensAt"],
  })

export const weeklyTimingsSchema = z.object({
  timings: z.array(businessTimingSchema).min(7, "Weekly timings must include all days"),
})

export const knowledgeEntrySchema = z.object({
  type: z.enum(["offer", "policy", "faq", "general"]),
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
})

export const documentUploadSchema = z.object({
  fileName: z.string().trim().min(1, "File name is required"),
  fileType: z.string().trim().min(1, "File type is required"),
  sizeBytes: z.coerce.number().int().positive("File size must be positive"),
})

export const orderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"]),
})

export const restaurantSettingsSchema = z.object({
  restaurantName: z.string().trim().min(1, "Restaurant name is required"),
  description: z.string().trim().default(""),
  phone: z.string().trim().min(1, "Phone number is required"),
  address: z.string().trim().min(1, "Address is required"),
  botTone: z.string().trim().min(1, "Bot tone is required"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type MenuItemInput = z.infer<typeof menuItemSchema>
export type BusinessTimingInput = z.infer<typeof businessTimingSchema>
export type KnowledgeEntryInput = z.infer<typeof knowledgeEntrySchema>
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>
export type OrderStatusInput = z.infer<typeof orderStatusSchema>
export type RestaurantSettingsInput = z.infer<typeof restaurantSettingsSchema>
