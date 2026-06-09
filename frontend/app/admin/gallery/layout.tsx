import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gallery",
  description: "Manage RoyalBite restaurant gallery — upload and organize food and ambiance photos.",
}

export default function AdminGalleryLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
