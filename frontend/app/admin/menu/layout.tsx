import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Menu Management",
  description: "Manage RoyalBite restaurant menu items — add, edit, update pricing and availability of dishes.",
}

export default function AdminMenuLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
