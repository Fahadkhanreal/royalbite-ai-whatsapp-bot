import { MetadataRoute } from "next"
import { SITE_CONFIG } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/menu", "/about"],
        disallow: [
          "/admin",
          "/api",
          "/login",
          "/_next",
          "/_global-error",
          "/_not-found",
        ],
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  }
}
