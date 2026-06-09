// Admin Gallery API — self-contained in frontend
import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { galleryImages } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const { src, alt, sortOrder } = await req.json()

    if (!src || !alt) {
      return NextResponse.json({ error: "src and alt are required" }, { status: 400 })
    }

    const [inserted] = await db.insert(galleryImages).values({
      src,
      alt,
      sortOrder: sortOrder ?? 0,
    }).returning({ id: galleryImages.id, src: galleryImages.src, alt: galleryImages.alt, sortOrder: galleryImages.sortOrder })

    return NextResponse.json({ success: true, data: inserted }, { status: 201 })
  } catch (error: any) {
    console.error("Admin gallery POST error:", error?.message)
    return NextResponse.json({ error: error?.message || "Internal error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    await db.delete(galleryImages).where(eq(galleryImages.id, id))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Admin gallery DELETE error:", error?.message)
    return NextResponse.json({ error: error?.message || "Internal error" }, { status: 500 })
  }
}
