import type { Metadata } from "next"
import { SITE_CONFIG } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Admin Login",
  description:
    "RoyalBite restaurant admin dashboard login. Authorized personnel only.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/login`,
  },
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
