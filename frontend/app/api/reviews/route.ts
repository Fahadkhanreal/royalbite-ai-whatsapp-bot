// Reviews API — public submit, admin manage
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { reviews, reviews as reviewsTable } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

// GET /api/reviews — public: only approved reviews
export async function GET() {
  try {
    const data = await db.query.reviews.findMany({
      where: eq(reviewsTable.status, "approved"),
      orderBy: desc(reviewsTable.createdAt),
    })
    return NextResponse.json({ success: true, data: { reviews: data } })
  } catch {
    return NextResponse.json({ success: true, data: { reviews: [] } })
  }
}

// POST /api/reviews — public: submit a new review
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, rating, text } = body

    if (!name || !rating || !text) {
      return NextResponse.json({ error: "name, rating, and text are required" }, { status: 400 })
    }
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "rating must be 1-5" }, { status: 400 })
    }

    const [inserted] = await db.insert(reviews).values({
      name: name.trim(),
      rating,
      text: text.trim(),
      status: "pending",
    }).returning()

    return NextResponse.json({ success: true, data: inserted }, { status: 201 })
  } catch (error: any) {
    console.error("Review submit error:", error?.message)
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
  }
}
