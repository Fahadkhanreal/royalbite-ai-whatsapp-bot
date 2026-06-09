'use client'

import { Bell, Home } from "lucide-react"
import Link from "next/link"

export function AdminNavbar() {
  return (
    <div className="flex items-center gap-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-[rgba(201,162,39,0.1)]"
        style={{ color: "#C9A227", border: "1px solid rgba(201,162,39,0.2)" }}
      >
        <Home className="size-3.5" />
        Home
      </Link>

      <button
        type="button"
        className="inline-flex shrink-0 items-center justify-center size-8 rounded-lg border border-transparent hover:bg-[rgba(201,162,39,0.1)] transition-all"
        style={{ color: "#A8B0B9" }}
      >
        <Bell className="size-5" />
      </button>
    </div>
  )
}
