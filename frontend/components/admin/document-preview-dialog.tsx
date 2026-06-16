'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, X } from "lucide-react"

interface DocumentPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: any
}

export function DocumentPreviewDialog({ open, onOpenChange, document }: DocumentPreviewDialogProps) {
  if (!document) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]" style={{ background: "rgba(20,15,12,0.95)", border: "1px solid rgba(201,162,39,0.2)" }}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle style={{ color: "#F8F5F0", fontFamily: "Playfair Display" }}>
              Document Preview
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-1 hover:bg-[rgba(239,68,68,0.1)]"
            >
              <X className="size-4" style={{ color: "#EF4444" }} />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Document Info */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg" style={{ background: "rgba(201,162,39,0.05)", border: "1px solid rgba(201,162,39,0.15)" }}>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: "#6B6560" }}>Source</p>
              <p className="text-sm font-medium" style={{ color: "#F8F5F0" }}>{document.fileName || "Unknown"}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: "#6B6560" }}>Document ID</p>
              <p className="text-xs font-mono" style={{ color: "#C9A227" }}>{document.id?.slice(0, 8)}...</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: "#6B6560" }}>Uploaded</p>
              <p className="text-sm" style={{ color: "#F8F5F0" }}>
                {document.uploadedAt ? new Date(document.uploadedAt).toLocaleString() : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: "#6B6560" }}>Status</p>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}>
                {document.status || "indexed"}
              </span>
            </div>
          </div>

          {/* Content Preview */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="size-4" style={{ color: "#C9A227" }} />
              <p className="text-sm font-medium" style={{ color: "#C9A227" }}>Content</p>
            </div>
            <div
              className="p-4 rounded-lg overflow-y-auto"
              style={{
                background: "rgba(248,245,240,0.03)",
                border: "1px solid rgba(201,162,39,0.15)",
                maxHeight: "400px",
                color: "#F8F5F0",
                fontFamily: "monospace",
                fontSize: "0.875rem",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap"
              }}
            >
              {document.content || "No content available"}
            </div>
          </div>

          {/* Metadata (if available) */}
          {document.metadata && (
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: "#C9A227" }}>Metadata</p>
              <pre
                className="p-3 rounded-lg overflow-x-auto text-xs"
                style={{
                  background: "rgba(248,245,240,0.03)",
                  border: "1px solid rgba(201,162,39,0.15)",
                  color: "#A8B0B9"
                }}
              >
                {JSON.stringify(document.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
