import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Analytics",
  description: "RoyalBite restaurant analytics — sales trends, order statistics, and performance metrics.",
}

export default function AdminAnalyticsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
