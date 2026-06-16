'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface KnowledgeEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry?: any
  onSave: (data: any) => Promise<void>
}

export function KnowledgeEntryDialog({ open, onOpenChange, entry, onSave }: KnowledgeEntryDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
  })

  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title || "",
        content: entry.content || "",
        category: entry.type || entry.category || "general",
      })
    } else {
      setFormData({
        title: "",
        content: "",
        category: "general",
      })
    }
  }, [entry, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave({ ...formData, id: entry?.id })
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" style={{ background: "rgba(20,15,12,0.95)", border: "1px solid rgba(201,162,39,0.2)" }}>
        <DialogHeader>
          <DialogTitle style={{ color: "#F8F5F0", fontFamily: "Playfair Display" }}>
            {entry ? "Edit Knowledge Entry" : "Add Knowledge Entry"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" style={{ color: "#C9A227" }}>Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Friday Special Offer"
              required
              style={{ background: "rgba(248,245,240,0.05)", border: "1px solid rgba(201,162,39,0.2)", color: "#F8F5F0" }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" style={{ color: "#C9A227" }}>Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger style={{ background: "rgba(248,245,240,0.05)", border: "1px solid rgba(201,162,39,0.2)", color: "#F8F5F0" }}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent style={{ background: "rgba(20,15,12,0.98)", border: "1px solid rgba(201,162,39,0.2)" }}>
                <SelectItem value="general" style={{ color: "#F8F5F0" }}>General</SelectItem>
                <SelectItem value="offers" style={{ color: "#F8F5F0" }}>Offers</SelectItem>
                <SelectItem value="policies" style={{ color: "#F8F5F0" }}>Policies</SelectItem>
                <SelectItem value="announcements" style={{ color: "#F8F5F0" }}>Announcements</SelectItem>
                <SelectItem value="seasonal" style={{ color: "#F8F5F0" }}>Seasonal</SelectItem>
                <SelectItem value="faq" style={{ color: "#F8F5F0" }}>FAQ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" style={{ color: "#C9A227" }}>Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="e.g., 50% off on all biryani orders every Friday!"
              rows={5}
              required
              style={{ background: "rgba(248,245,240,0.05)", border: "1px solid rgba(201,162,39,0.2)", color: "#F8F5F0" }}
            />
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
              disabled={loading}
              style={{ background: "linear-gradient(135deg, #C9A227, #A67D1F)", color: "#0A0A0A" }}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
