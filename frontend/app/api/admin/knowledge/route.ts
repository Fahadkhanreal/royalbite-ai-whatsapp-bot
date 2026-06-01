import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { listKnowledgeEntries, createKnowledgeEntry, updateKnowledgeEntry, deleteKnowledgeEntry } from "@/lib/repositories/admin-data"
import { apiResponse } from "@/lib/api-response"

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const entries = await listKnowledgeEntries()
    return NextResponse.json(entries)
  } catch (error) {
    return apiResponse.unauthorized()
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const entry = await createKnowledgeEntry(body)
    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    return apiResponse.serverError()
  }
}
