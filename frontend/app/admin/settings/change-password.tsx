"use client"

import { useState } from "react"
import { KeyRound } from "lucide-react"
import { toast } from "sonner"

export function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all fields")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success("Password changed successfully! 🔐")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      toast.error(err.message || "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl p-6" style={{ background: "rgba(20,15,12,0.6)", border: "1px solid rgba(201,162,39,0.12)", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
      <h3 className="text-lg font-playfair font-bold mb-5 flex items-center gap-2" style={{ color: "#F8F5F0" }}>
        <KeyRound className="size-5" style={{ color: "#C9A227" }} />
        Change Password
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" style={{ color: "#F8F5F0" }}>Current Password</label>
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:border-[#C9A227]"
            style={{ background: "rgba(10,10,10,0.6)", border: "1px solid rgba(201,162,39,0.2)", color: "#F8F5F0" }} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" style={{ color: "#F8F5F0" }}>New Password</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:border-[#C9A227]"
            style={{ background: "rgba(10,10,10,0.6)", border: "1px solid rgba(201,162,39,0.2)", color: "#F8F5F0" }} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" style={{ color: "#F8F5F0" }}>Confirm New Password</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:border-[#C9A227]"
            style={{ background: "rgba(10,10,10,0.6)", border: "1px solid rgba(201,162,39,0.2)", color: "#F8F5F0" }} />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2.5 rounded-xl text-sm font-playfair font-bold transition-all hover:shadow-[0_0_40px_rgba(201,162,39,0.6)] hover:scale-[1.02] disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #C9A227, #A67D1F)", color: "#0A0A0A", boxShadow: "0 0 20px rgba(201,162,39,0.3)" }}>
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  )
}
