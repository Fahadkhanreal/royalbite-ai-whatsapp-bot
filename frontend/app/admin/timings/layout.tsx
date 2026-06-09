import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Business Timings",
  description: "Configure RoyalBite restaurant opening hours, holidays, and business schedules.",
}

export default function AdminTimingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
