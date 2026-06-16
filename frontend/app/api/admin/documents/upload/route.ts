import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { ingestDocument } from "@/lib/rag/ingest"

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const source = (formData.get("source") as string) || "general"

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    // Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    let text = ""

    // Extract text based on file type
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      try {
        // Dynamic import for pdf-parse to work with Next.js
        const pdfParse = (await import("pdf-parse")).default
        const pdfData = await pdfParse(buffer)
        text = pdfData.text
      } catch (error) {
        console.error("PDF parsing error:", error)
        return NextResponse.json(
          { error: "Failed to parse PDF file" },
          { status: 400 }
        )
      }
    } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      text = buffer.toString("utf-8")
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF or TXT files." },
        { status: 400 }
      )
    }

    // Validate extracted text
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "No text content found in the file" },
        { status: 400 }
      )
    }

    // Ingest document (chunks, embeds, stores)
    const result = await ingestDocument(text, {
      source: source,
      metadata: {
        fileName: file.name,
        fileType: file.type || "unknown",
        uploadedAt: new Date().toISOString(),
      } as any,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          documentId: result.documentId,
          chunksCreated: result.chunksCreated,
          fileName: file.name,
          source: source,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Document upload error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 500 }
    )
  }
}
