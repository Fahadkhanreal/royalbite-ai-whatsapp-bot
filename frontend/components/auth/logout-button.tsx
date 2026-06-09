"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      className="gap-2"
      style={{ color: "#A8B0B9" }}
      onClick={() => signOut({ callbackUrl: "/login" })}
      onMouseEnter={(e) => { e.currentTarget.style.color = "#C9A227" }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "#A8B0B9" }}
    >
      <LogOut className="size-4" />
      Logout
    </Button>
  )
}
