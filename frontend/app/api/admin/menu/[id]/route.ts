import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { dishes } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { syncMenuToRAG } from "@/lib/rag/auto-ingest"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()

    const updateData: Record<string, any> = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.price !== undefined) updateData.price = body.price.toString()
    if (body.category !== undefined) updateData.category = body.category
    if (body.isAvailable !== undefined) updateData.isAvailable = body.isAvailable
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl

    const [updated] = await db.update(dishes)
      .set(updateData)
      .where(eq(dishes.id, id))
      .returning()

    syncMenuToRAG().catch(() => {})

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return NextResponse.json({ error: "Invalid menu item data" }, { status: 400 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    await db.delete(dishes).where(eq(dishes.id, id))

    syncMenuToRAG().catch(() => {})

    return NextResponse.json({ success: true, id })
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
