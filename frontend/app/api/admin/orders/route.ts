import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { listOrders, updateOrderStatus } from "@/lib/repositories/admin-data"
import { apiResponse } from "@/lib/api-response"

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const orders = await listOrders()
    return NextResponse.json(orders)
  } catch (error) {
    return apiResponse.unauthorized()
  }
}
