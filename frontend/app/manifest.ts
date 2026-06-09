import { MetadataRoute } from "next"
import { SITE_CONFIG } from "@/lib/seo"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RoyalBite - Premium Pakistani Restaurant",
    short_name: "RoyalBite",
    description: SITE_CONFIG.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A0A",
    theme_color: "#C9A227",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["food", "restaurant", "lifestyle"],
    lang: "en",
    dir: "ltr",
  }
}
