'use client'

import { useState, useEffect } from "react"
import { Plus, BookOpen } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { EmptyState } from "@/components/common/feedback-states"
import { KnowledgeEntryDialog } from "@/components/admin/knowledge-entry-dialog"
import { useRouter } from "next/navigation"

export default function KnowledgePage() {
  const router = useRouter()
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<any>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  // Fetch entries
  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/admin/knowledge')
      const data = await res.json()
      setEntries(data.data?.entries || [])
    } catch (error) {
      console.error('Failed to fetch knowledge entries:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  // Handle save (create or update)
  const handleSave = async (data: any) => {
    try {
      if (data.id) {
        // Update existing entry
        await fetch('/api/admin/knowledge', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } else {
        // Create new entry
        await fetch('/api/admin/knowledge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      }
      await fetchEntries()
      router.refresh()
    } catch (error) {
      console.error('Failed to save entry:', error)
      throw error
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    setDeleteLoading(id)
    try {
      await fetch(`/api/admin/knowledge?id=${id}`, {
        method: 'DELETE',
      })
      await fetchEntries()
      router.refresh()
    } catch (error) {
      console.error('Failed to delete entry:', error)
    } finally {
      setDeleteLoading(null)
    }
  }

  // Open dialog for new entry
  const handleAddNew = () => {
    setSelectedEntry(null)
    setDialogOpen(true)
  }

  // Open dialog for editing
  const handleEdit = (entry: any) => {
    setSelectedEntry(entry)
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div style={{ color: "#C9A227" }}>Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader title="Knowledge Base" description="Manage offers, policies, FAQs, and other customer-facing information." />
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-playfair font-bold transition-all duration-300 hover:shadow-[0_0_40px_rgba(201,162,39,0.6)] hover:scale-[1.04] whitespace-nowrap"
          style={{ background: "linear-gradient(135deg, #C9A227, #A67D1F)", color: "#0A0A0A", boxShadow: "0 0 20px rgba(201,162,39,0.3)" }}>
          <Plus className="size-4" /> Add Entry
        </button>
      </div>

      {entries.length === 0 ? (
        <EmptyState title="No knowledge entries yet" description="Add offers, policies, and FAQs to help customers understand your restaurant." />
      ) : (
        <div className="space-y-4">
          {entries.map((entry: any) => (
            <div key={entry.id} className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: "rgba(20,15,12,0.6)", border: "1px solid rgba(201,162,39,0.12)", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "linear-gradient(90deg, transparent, #C9A227, transparent)" }} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-playfair font-bold" style={{ color: "#F8F5F0" }}>{entry.title}</h3>
                    <p className="text-xs mt-0.5" style={{ color: "#6B6560" }}>{entry.category || "General"}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(201,162,39,0.15)", color: "#C9A227", border: "1px solid rgba(201,162,39,0.3)" }}>
                    {entry.category || "general"}
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "#A8B0B9" }}>{entry.content}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all hover:bg-[rgba(201,162,39,0.15)]"
                    style={{ background: "rgba(201,162,39,0.08)", color: "#C9A227", border: "1px solid rgba(201,162,39,0.15)" }}>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={deleteLoading === entry.id}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all hover:bg-[rgba(239,68,68,0.2)]"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                    {deleteLoading === entry.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <KnowledgeEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        entry={selectedEntry}
        onSave={handleSave}
      />
    </div>
  )
}
