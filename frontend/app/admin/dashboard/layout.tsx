import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "RoyalBite admin dashboard — view orders, popular dishes, and restaurant performance at a glance.",
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
