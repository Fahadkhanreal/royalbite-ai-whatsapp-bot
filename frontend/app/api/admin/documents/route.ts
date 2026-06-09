import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { documents } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { ingestDocument } from "@/lib/rag/ingest"
import { generateEmbedding } from "@/lib/rag/embeddings"

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const rows = await db.query.documents.findMany({
      orderBy: (docs: any) => docs.createdAt,
    })
    return NextResponse.json({ data: { documents: rows } })
  } catch (error) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      // Support JSON-based document creation too
      const body = await req.json().catch(() => null)
      if (body?.content) {
        const result = await ingestDocument(body.content, {
          source: body.source || "manual_upload",
          metadata: { type: body.type || "general" },
        })
        return NextResponse.json({ success: true, data: result }, { status: 201 })
      }
      return NextResponse.json({ error: "File or content is required" }, { status: 400 })
    }

    // Process file upload
    const text = await file.text()
    const result = await ingestDocument(text, {
      source: file.name,
      metadata: { type: "general", fileName: file.name } as any,
    })

    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error) {
    console.error("Document POST error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    await db.delete(documents).where(eq(documents.id, id))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
