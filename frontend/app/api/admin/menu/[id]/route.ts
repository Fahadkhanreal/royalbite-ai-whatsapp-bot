import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { menuItemSchema } from "@/lib/validations/admin"
import { updateMenuItem, deleteMenuItem } from "@/lib/repositories/admin-data"
import { apiResponse } from "@/lib/api-response"

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const body = await req.json()
    const validated = menuItemSchema.partial().parse(body)
    const item = await updateMenuItem(params.id, validated)
    return NextResponse.json(item)
  } catch (error) {
    if (error instanceof Error && error.message.includes("validation")) {
      return apiResponse.badRequest("Invalid menu item data")
    }
    return apiResponse.serverError()
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    await deleteMenuItem(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return apiResponse.serverError()
  }
}
