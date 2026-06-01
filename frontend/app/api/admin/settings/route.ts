import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { getRestaurantSettings, updateRestaurantSettings } from "@/lib/repositories/admin-data"
import { apiResponse } from "@/lib/api-response"

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const settings = await getRestaurantSettings()
    return NextResponse.json(settings)
  } catch (error) {
    return apiResponse.unauthorized()
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const settings = await updateRestaurantSettings(body)
    return NextResponse.json(settings)
  } catch (error) {
    return apiResponse.serverError()
  }
}
