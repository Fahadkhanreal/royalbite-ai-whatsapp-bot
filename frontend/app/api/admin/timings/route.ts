import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { getBusinessTimings, updateBusinessTimings } from "@/lib/repositories/admin-data"
import { apiResponse } from "@/lib/api-response"

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const timings = await getBusinessTimings()
    return NextResponse.json(timings)
  } catch (error) {
    return apiResponse.unauthorized()
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const timings = await updateBusinessTimings(body)
    return NextResponse.json(timings)
  } catch (error) {
    return apiResponse.serverError()
  }
}
