import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { reindexDocument, deleteDocument } from "@/lib/repositories/admin-data"
import { apiResponse } from "@/lib/api-response"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const document = await reindexDocument(params.id)
    return NextResponse.json(document)
  } catch (error) {
    return apiResponse.serverError()
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    await deleteDocument(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return apiResponse.serverError()
  }
}
