import type { Metadata } from "next"
import { LogoutButton } from "@/components/auth/logout-button"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AdminNavbar } from "@/components/layout/admin-navbar"
import { requireAdmin } from "@/lib/admin-auth"

export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard | RoyalBite",
    template: "%s | RoyalBite Admin",
  },
  description:
    "RoyalBite restaurant admin dashboard — manage menu, orders, timings, knowledge base, documents, and analytics.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin()

  return (
    <div style={{ backgroundColor: "#0A0A0A" }} className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b backdrop-blur-md" style={{ backgroundColor: "rgba(10,10,10,0.92)", borderColor: "rgba(201, 162, 39, 0.15)" }}>
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#C9A227" }}>RoyalBite AI</p>
              <p className="font-semibold truncate" style={{ color: "#F8F5F0" }}>Admin Dashboard</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <AdminNavbar />
              <div className="hidden md:block text-right text-sm">
                <p className="font-medium truncate max-w-[120px]" style={{ color: "#F8F5F0" }}>{admin.name}</p>
                <p className="text-xs truncate max-w-[120px]" style={{ color: "#A8B0B9" }}>{admin.email}</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
