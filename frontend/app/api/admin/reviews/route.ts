// Admin Reviews API — list all, approve/reject
import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { reviews } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

// GET /api/admin/reviews — list all reviews (pending + approved + rejected)
export async function GET() {
  try {
    await requireAdmin()
    const data = await db.query.reviews.findMany({
      orderBy: desc(reviews.createdAt),
    })
    return NextResponse.json({ success: true, data: { reviews: data } })
  } catch {
    return NextResponse.json({ success: true, data: { reviews: [] } })
  }
}

// PUT /api/admin/reviews?id=xxx&status=approved|rejected
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const status = searchParams.get("status")

    if (!id || !status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "id and status (approved/rejected) required" }, { status: 400 })
    }

    await db.update(reviews).set({ status: status as any }).where(eq(reviews.id, id))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Admin review update error:", error?.message)
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
  }
}

// DELETE /api/admin/reviews?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    await db.delete(reviews).where(eq(reviews.id, id))
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Admin review delete error:", error?.message)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}
