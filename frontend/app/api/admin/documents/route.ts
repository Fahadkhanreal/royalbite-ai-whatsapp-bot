import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { listDocuments, uploadDocument } from "@/lib/repositories/admin-data"
import { apiResponse } from "@/lib/api-response"

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const documents = await listDocuments()
    return NextResponse.json(documents)
  } catch (error) {
    return apiResponse.unauthorized()
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return apiResponse.badRequest("File is required")
    }

    const document = await uploadDocument(file)
    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    return apiResponse.serverError()
  }
}
