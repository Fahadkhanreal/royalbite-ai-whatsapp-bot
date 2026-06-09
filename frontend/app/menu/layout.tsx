import type { Metadata } from "next"
import { SITE_CONFIG } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Full Menu",
  description:
    "Browse RoyalBite's complete menu — Pakistani & Continental cuisine. Order biryani, karahi, BBQ & more via WhatsApp in Karachi.",
  openGraph: {
    title: "RoyalBite Menu - Full Menu Online | Pakistani & Continental Cuisine",
    description: "Explore our complete menu with authentic Pakistani dishes, BBQ, and Continental favorites. Order directly via WhatsApp.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "RoyalBite Full Menu",
      },
    ],
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/menu`,
  },
}

export default function MenuLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
