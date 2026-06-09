import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { menuItemSchema } from "@/lib/validations/admin"
import { listMenuItems } from "@/lib/repositories/admin-data"

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const items = await listMenuItems()
    return NextResponse.json(items)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const validated = menuItemSchema.parse(body)
    return NextResponse.json({ ...validated, id: "new" }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid menu item data" }, { status: 400 })
  }
}
