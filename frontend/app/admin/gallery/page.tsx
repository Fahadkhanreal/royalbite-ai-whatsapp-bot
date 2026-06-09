"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Upload, Trash2, GripVertical, ImageIcon, X } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { toast } from "sonner"

interface GalleryImage {
  id: string
  src: string
  alt: string
  sortOrder: number
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [altText, setAltText] = useState("")
  useEffect(() => {
    fetchGallery()
  }, [])

  async function fetchGallery() {
    try {
      const res = await fetch("/api/gallery")
      const json = await res.json()
      setImages(json.data?.images || [])
    } catch {
      toast.error("Failed to load gallery")
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      toast.error("Please select an image")
      return
    }
    if (!altText.trim()) {
      toast.error("Please enter a description")
      return
    }

    setUploading(true)
    try {
      // First upload the file
      const formData = new FormData()
      formData.append("image", selectedFile)
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const uploadJson = await uploadRes.json()
      if (!uploadJson.success) {
        throw new Error("Upload failed")
      }

      // Save to gallery via admin API
      const saveRes = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          src: uploadJson.imageUrl,
          alt: altText.trim(),
          sortOrder: images.length,
        }),
      })

      if (!saveRes.ok) throw new Error("Save failed")

      toast.success("Image added to gallery! 🎉")
      setSelectedFile(null)
      setAltText("")
      await fetchGallery()
    } catch (err) {
      toast.error("Failed to upload image")
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/gallery?id=${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Delete failed")
      toast.success("Image deleted")
      await fetchGallery()
    } catch {
      toast.error("Failed to delete image")
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Gallery" description="Manage restaurant gallery images." />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse rounded-xl aspect-[4/3]" style={{ background: "rgba(40,30,25,0.6)" }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Gallery" description="Manage restaurant gallery images." />

      {/* Upload Section */}
      <div className="rounded-xl p-6 transition-all" style={{ background: "rgba(20,15,12,0.6)", border: "1px solid rgba(201,162,39,0.12)" }}>
        <h3 className="font-playfair font-bold mb-4" style={{ color: "#F8F5F0" }}>Add New Image</h3>
        <div className="space-y-4">
          {/* File Picker */}
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-3 px-5 py-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
              style={{ background: "rgba(201,162,39,0.1)", border: "1px dashed rgba(201,162,39,0.4)", color: "#C9A227" }}>
              <Upload className="size-5" />
              <span className="text-sm font-medium">{selectedFile ? selectedFile.name : "Choose Image"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </label>
            {selectedFile && (
              <button onClick={() => setSelectedFile(null)} style={{ color: "#EF4444" }} className="text-sm hover:underline">
                <X className="size-4 inline" /> Remove
              </button>
            )}
          </div>

          {/* Alt Text */}
          {selectedFile && (
            <div className="flex items-center gap-4 flex-wrap">
              <input
                type="text"
                placeholder="Image description (e.g. Sindhi Biryani)"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ background: "rgba(10,10,10,0.6)", border: "1px solid rgba(201,162,39,0.3)", color: "#F8F5F0" }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#C9A227"}
                onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,162,39,0.3)"}
              />
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #C9A227, #A67D1F)", color: "#0A0A0A" }}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ background: "rgba(20,15,12,0.6)", border: "1px solid rgba(201,162,39,0.12)" }}>
          <ImageIcon className="size-12 mx-auto mb-4" style={{ color: "#6B6560" }} />
          <p className="font-playfair font-bold text-xl mb-2" style={{ color: "#F8F5F0" }}>No images yet</p>
          <p style={{ color: "#A8B0B9" }} className="text-sm">Upload your first gallery image above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{ background: "rgba(20,15,12,0.6)", border: "1px solid rgba(201,162,39,0.12)" }}
            >
              {/* Grip handle */}
              <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-1.5 rounded-lg cursor-grab" style={{ background: "rgba(10,10,10,0.7)" }}>
                  <GripVertical className="size-4" style={{ color: "#A8B0B9" }} />
                </div>
              </div>

              {/* Delete button */}
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(image.id)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ background: "rgba(239,68,68,0.2)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.4)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.2)"}
                >
                  <Trash2 className="size-4" style={{ color: "#EF4444" }} />
                </button>
              </div>

              {/* Image */}
              <div className="aspect-[4/3] relative">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Alt label */}
              <div className="p-3">
                <p className="text-xs truncate" style={{ color: "#A8B0B9" }}>{image.alt}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
