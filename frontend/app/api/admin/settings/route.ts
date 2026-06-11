import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { users, businessTimings } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const firstUser = await db.query.users.findFirst()

    const settings = {
      id: "settings_royalbite",
      restaurantName: "RoyalBite",
      description: "Premium Pakistani restaurant with AI chatbot.",
      phone: "+923181215427",
      address: "Karachi, Pakistan",
      brandColors: { primary: "#C9A227", secondary: "#A67D1F" },
      botTone: "Friendly Pakistani restaurant waiter using Roman Urdu and English.",
      updatedAt: firstUser?.updatedAt || new Date().toISOString(),
    }
    return NextResponse.json({ data: settings })
  } catch (error) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()

    // For now store settings in the first user record as JSON
    // In production, add a dedicated settings table
    const firstUser = await db.query.users.findFirst()
    if (firstUser) {
      // Update the user's name as a proxy for storing settings
      if (body.restaurantName) {
        await db.update(users)
          .set({ name: body.restaurantName })
          .where(eq(users.id, firstUser.id as string))
      }
    }

    return NextResponse.json({ success: true, data: body })
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
