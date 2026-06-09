import { MetadataRoute } from "next"
import { SITE_CONFIG } from "@/lib/seo"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url

  // Static routes with their change frequency and priority
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.1,
    },
  ]

  // Admin routes (indexed but low priority, nofollow in robots)
  const adminRoutes = [
    {
      url: `${baseUrl}/admin/dashboard`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/admin/menu`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.2,
    },
    {
      url: `${baseUrl}/admin/orders`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.2,
    },
  ]

  return [...staticRoutes, ...adminRoutes]
}
