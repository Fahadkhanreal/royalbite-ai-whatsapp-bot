import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { updateOrderStatus } from "@/lib/repositories/admin-data"
import { apiResponse } from "@/lib/api-response"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { status } = body

    if (!status) {
      return apiResponse.badRequest("Status is required")
    }

    const order = await updateOrderStatus(params.id, status)
    return NextResponse.json(order)
  } catch (error) {
    return apiResponse.serverError()
  }
}
