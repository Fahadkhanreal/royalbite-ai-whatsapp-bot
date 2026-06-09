import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Orders",
  description: "View and manage customer orders — confirm, prepare, and deliver orders from RoyalBite.",
}

export default function AdminOrdersLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
