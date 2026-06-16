'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText } from "lucide-react"

interface DocumentUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (file: File, source: string) => Promise<void>
}

export function DocumentUploadDialog({ open, onOpenChange, onUpload }: DocumentUploadDialogProps) {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [source, setSource] = useState<string>("menu")
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (isValidFile(droppedFile)) {
        setFile(droppedFile)
      } else {
        alert("Please upload a PDF or TXT file only")
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (isValidFile(selectedFile)) {
        setFile(selectedFile)
      } else {
        alert("Please upload a PDF or TXT file only")
      }
    }
  }

  const isValidFile = (file: File): boolean => {
    const validTypes = ['application/pdf', 'text/plain']
    const validExtensions = ['.pdf', '.txt']
    return validTypes.includes(file.type) || validExtensions.some(ext => file.name.endsWith(ext))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      alert("Please select a file")
      return
    }

    setLoading(true)
    try {
      await onUpload(file, source)
      setFile(null)
      onOpenChange(false)
    } catch (error) {
      console.error("Upload failed:", error)
      alert("Failed to upload document. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" style={{ background: "rgba(20,15,12,0.95)", border: "1px solid rgba(201,162,39,0.2)" }}>
        <DialogHeader>
          <DialogTitle style={{ color: "#F8F5F0", fontFamily: "Playfair Display" }}>
            Upload Document
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source" style={{ color: "#C9A227" }}>Document Type</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger style={{ background: "rgba(248,245,240,0.05)", border: "1px solid rgba(201,162,39,0.2)", color: "#F8F5F0" }}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent style={{ background: "rgba(20,15,12,0.98)", border: "1px solid rgba(201,162,39,0.2)" }}>
                <SelectItem value="menu" style={{ color: "#F8F5F0" }}>Menu</SelectItem>
                <SelectItem value="faq" style={{ color: "#F8F5F0" }}>FAQ</SelectItem>
                <SelectItem value="policy" style={{ color: "#F8F5F0" }}>Policy</SelectItem>
                <SelectItem value="general" style={{ color: "#F8F5F0" }}>General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label style={{ color: "#C9A227" }}>File Upload (PDF or TXT)</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-[#C9A227] bg-[rgba(201,162,39,0.1)]' : 'border-[rgba(201,162,39,0.3)]'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="space-y-2">
                  <FileText className="size-8 mx-auto" style={{ color: "#C9A227" }} />
                  <p className="text-sm font-medium" style={{ color: "#F8F5F0" }}>{file.name}</p>
                  <p className="text-xs" style={{ color: "#6B6560" }}>
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="size-8 mx-auto" style={{ color: "#C9A227" }} />
                  <p className="text-sm font-medium" style={{ color: "#F8F5F0" }}>
                    Drag & drop or click to browse
                  </p>
                  <p className="text-xs" style={{ color: "#6B6560" }}>
                    Supports: PDF, TXT (Max 10MB)
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.2)", color: "#C9A227" }}
                    >
                      Browse Files
                    </Button>
                  </label>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !file}
              style={{ background: "linear-gradient(135deg, #C9A227, #A67D1F)", color: "#0A0A0A" }}
            >
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
