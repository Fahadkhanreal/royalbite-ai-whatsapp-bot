import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings",
  description: "Configure RoyalBite restaurant settings — name, contact info, bot tone, and admin preferences.",
}

export default function AdminSettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
