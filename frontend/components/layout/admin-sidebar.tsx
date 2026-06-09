'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BarChart3, BookOpen, FileText, ImageIcon,
  Menu, Settings, ShoppingBag, UtensilsCrossed,
  X, Clock, Home, Star,
} from "lucide-react"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/timings", label: "Timings", icon: Clock },
  { href: "/admin/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/admin/documents", label: "Documents", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-40 md:hidden flex items-center justify-center"
        style={{ color: "#C9A227", background: "rgba(10,10,10,0.8)", backdropFilter: "blur(8px)", width: 40, height: 40, borderRadius: 10, border: "1px solid rgba(201,162,39,0.2)" }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 w-64 border-r transition-transform duration-300 md:sticky md:block md:translate-x-0 md:h-screen md:overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundColor: "rgba(12, 10, 8, 0.98)", borderColor: "rgba(201, 162, 39, 0.1)" }}
      >
        <div className="flex h-16 items-center px-6 border-b border-[rgba(201,162,39,0.08)] md:hidden">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg font-bold" style={{ background: "linear-gradient(135deg, #C9A227, #8B6914)", color: "#0A0A0A" }}>
              R
            </div>
            <span className="font-bold" style={{ color: "#F8F5F0" }}>RoyalBite</span>
          </Link>
        </div>
        <div className="space-y-6 p-4 pt-6 md:pt-6">
          <div className="hidden md:block">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg font-bold" style={{ background: "linear-gradient(135deg, #C9A227, #8B6914)", color: "#0A0A0A" }}>
                R
              </div>
              <span className="font-bold" style={{ color: "#F8F5F0" }}>RoyalBite</span>
            </Link>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive ? "shadow-sm" : ""
                  )}
                  style={{
                    backgroundColor: isActive ? "rgba(201, 162, 39, 0.1)" : "transparent",
                    color: isActive ? "#C9A227" : "#A8B0B9"
                  }}
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "rgba(201, 162, 39, 0.05)"; e.currentTarget.style.color = "#C9A227"; } }}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#A8B0B9"; } }}
                >
                  <Icon className="size-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
