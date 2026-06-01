import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Playfair_Display } from "next/font/google"
import { AppProviders } from "@/components/common/app-providers"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: {
    default: "RoyalBite - Premium Pakistani Restaurant",
    template: "%s | RoyalBite",
  },
  description:
    "Experience authentic Pakistani & Continental cuisine at RoyalBite. Premium WhatsApp ordering, verified menu, and warm hospitality in Karachi.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "RoyalBite - Premium Pakistani Restaurant",
    description: "Experience authentic Pakistani & Continental cuisine",
    url: "http://localhost:3000",
    siteName: "RoyalBite",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "RoyalBite Restaurant",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoyalBite - Premium Pakistani Restaurant",
    description: "Experience authentic Pakistani & Continental cuisine",
    images: ["/og-image.jpg"],
  },
  keywords: [
    "Pakistani restaurant",
    "Karachi food",
    "WhatsApp ordering",
    "biryani",
    "continental cuisine",
    "premium dining",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} dark h-full antialiased`}
      suppressHydrationWarning
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
