import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { menuItemSchema } from "@/lib/validations/admin"
import { listMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from "@/lib/repositories/admin-data"
import { apiResponse } from "@/lib/api-response"

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const items = await listMenuItems()
    return NextResponse.json(items)
  } catch (error) {
    return apiResponse.unauthorized()
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const validated = menuItemSchema.parse(body)
    const item = await createMenuItem(validated)
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes("validation")) {
      return apiResponse.badRequest("Invalid menu item data")
    }
    return apiResponse.serverError()
  }
}
