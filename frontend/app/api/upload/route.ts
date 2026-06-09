import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import sharp from "sharp"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File | null
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Compress image with sharp — resize to max 1200px width, reduce quality
    const compressed = await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .webp({ quality: 75 })
      .toBuffer()

    // Clean filename
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const name = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase().slice(0, 40)
    const filename = `${name}-${Date.now()}.${ext}`
    const uploadDir = path.join(process.cwd(), "public", "uploads", "dishes")

    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), compressed)

    const imageUrl = `/uploads/dishes/${filename}`
    const originalSize = (buffer.length / 1024 / 1024).toFixed(1)
    const compressedSize = (compressed.length / 1024 / 1024).toFixed(1)

    console.log(`📸 Image uploaded: ${filename} | ${originalSize}MB → ${compressedSize}MB`)

    return NextResponse.json({ success: true, imageUrl })
  } catch (error: any) {
    console.error("Upload error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
