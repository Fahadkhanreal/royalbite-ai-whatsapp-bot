import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50", 10)
    const offset = parseInt(searchParams.get("offset") || "0", 10)

    let rows
    if (status) {
      rows = await db.query.orders.findMany({
        where: eq(orders.status, status as any),
        limit,
        offset,
        orderBy: desc(orders.createdAt),
        with: {
          items: {
            with: { dish: true },
          },
        },
      })
    } else {
      rows = await db.query.orders.findMany({
        limit,
        offset,
        orderBy: desc(orders.createdAt),
        with: {
          items: {
            with: { dish: true },
          },
        },
      })
    }

    return NextResponse.json({ data: { orders: rows } })
  } catch (error) {
    console.error("Admin orders GET error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
