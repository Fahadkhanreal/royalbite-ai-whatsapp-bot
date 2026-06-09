// Change password API
import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "currentPassword and newPassword are required" }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 })
    }

    // Verify current password
    const user = await db.query.users.findFirst({
      where: eq(users.id, admin.id),
    })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })

    // Hash new password
    const hash = await bcrypt.hash(newPassword, 12)
    await db.update(users).set({ passwordHash: hash }).where(eq(users.id, admin.id))

    return NextResponse.json({ success: true, message: "Password changed successfully" })
  } catch (error: any) {
    console.error("Change password error:", error?.message)
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}
