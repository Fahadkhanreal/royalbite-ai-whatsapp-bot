import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { knowledgeBase } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { syncKnowledgeToRAG } from "@/lib/rag/auto-ingest"

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const rows = await db.query.knowledgeBase.findMany({
      orderBy: (kb: any) => kb.createdAt,
    })
    return NextResponse.json({ data: { entries: rows } })
  } catch (error) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()

    const [entry] = await db.insert(knowledgeBase).values({
      title: body.title || "Untitled",
      content: body.content || "",
      category: body.category || "general",
      source: body.source || "manual",
    }).returning()

    syncKnowledgeToRAG().catch(() => {})

    return NextResponse.json({ success: true, data: entry }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const updateData: Record<string, any> = {}
    if (data.title) updateData.title = data.title
    if (data.content) updateData.content = data.content
    if (data.category) updateData.category = data.category

    const [updated] = await db.update(knowledgeBase)
      .set(updateData)
      .where(eq(knowledgeBase.id, id))
      .returning()

    syncKnowledgeToRAG().catch(() => {})

    return NextResponse.json({ success: true, data: updated })
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id))

    syncKnowledgeToRAG().catch(() => {})

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
