import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const validStatuses = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const updateData: Record<string, any> = { status }
    if (status === "confirmed") updateData.confirmedAt = new Date().toISOString()
    if (status === "delivered") updateData.deliveredAt = new Date().toISOString()

    const [updated] = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, id, status })
  } catch (error) {
    console.error("Order status update error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
