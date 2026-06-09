import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { businessTimings } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { syncTimingsToRAG } from "@/lib/rag/auto-ingest"

const DAYS_MAP = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const rows = await db.query.businessTimings.findMany({
      orderBy: businessTimings.dayOfWeek,
    })
    return NextResponse.json({ data: { timings: rows } })
  } catch (error) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()

    // Support both single and batch timing updates
    const timings = Array.isArray(body) ? body : (body.timings || [body])

    const results = []
    for (const timing of timings) {
      const dayOfWeek = typeof timing.dayOfWeek === "string"
        ? DAYS_MAP.indexOf(timing.dayOfWeek.toLowerCase())
        : timing.dayOfWeek

      if (dayOfWeek < 0 || dayOfWeek > 6) continue

      const existing = await db.query.businessTimings.findFirst({
        where: eq(businessTimings.dayOfWeek, dayOfWeek),
      })

      const { dayOfWeek: dow, openTime: oT, closeTime: cT, isHoliday: h, isOpen } = timing
      const insertData = {
        dayOfWeek,
        openTime: oT || cT || "11:00:00",
        closeTime: cT || oT || "22:00:00",
        isHoliday: typeof isOpen === "boolean" ? !isOpen : (h ?? false),
      }

      if (existing) {
        const [updated] = await db.update(businessTimings)
          .set(insertData)
          .where(eq(businessTimings.id, existing.id as string))
          .returning()
        results.push(updated)
      } else {
        const [created] = await db.insert(businessTimings)
          .values(insertData)
          .returning()
        results.push(created)
      }
    }

    syncTimingsToRAG().catch(() => {})

    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    console.error("Timings PUT error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
