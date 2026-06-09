// Change email API
import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const { newEmail, password } = await req.json()

    if (!newEmail || !password) {
      return NextResponse.json({ error: "newEmail and password are required" }, { status: 400 })
    }

    // Verify password
    const user = await db.query.users.findFirst({
      where: eq(users.id, admin.id),
    })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const bcrypt = await import("bcryptjs")
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return NextResponse.json({ error: "Password is incorrect" }, { status: 400 })

    // Check if email already taken
    const existing = await db.query.users.findFirst({
      where: eq(users.email, newEmail),
    })
    if (existing && existing.id !== admin.id) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    await db.update(users).set({ email: newEmail }).where(eq(users.id, admin.id))

    return NextResponse.json({ success: true, message: "Email changed successfully" })
  } catch (error: any) {
    console.error("Change email error:", error?.message)
    return NextResponse.json({ error: "Failed to change email" }, { status: 500 })
  }
}
