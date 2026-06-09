import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reviews",
  description: "Approve and manage customer reviews for RoyalBite restaurant.",
}

export default function AdminReviewsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
