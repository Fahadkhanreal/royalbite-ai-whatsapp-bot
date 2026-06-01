import { LogoutButton } from "@/components/auth/logout-button"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AdminNavbar } from "@/components/layout/admin-navbar"
import { requireAdmin } from "@/lib/admin-auth"

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-md md:ml-64">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">RoyalBite AI</p>
            <p className="font-semibold text-foreground">Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <AdminNavbar />
            <div className="hidden text-right text-sm sm:block">
              <p className="font-medium text-foreground">{admin.name}</p>
              <p className="text-xs text-muted-foreground">{admin.email}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="md:ml-64 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
