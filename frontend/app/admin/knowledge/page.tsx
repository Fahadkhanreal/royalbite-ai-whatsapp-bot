import { Plus, BookOpen } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Badge } from "@/components/ui/badge"
import { listKnowledgeEntries } from "@/lib/repositories/admin-data"
import { EmptyState } from "@/components/common/feedback-states"

export default async function KnowledgePage() {
  const entries = await listKnowledgeEntries()

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader title="Knowledge Base" description="Manage offers, policies, FAQs, and other customer-facing information." />
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-playfair font-bold transition-all duration-300 hover:shadow-[0_0_40px_rgba(201,162,39,0.6)] hover:scale-[1.04] whitespace-nowrap"
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
                    <p className="text-xs mt-0.5" style={{ color: "#6B6560" }}>{entry.type || "General"}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(201,162,39,0.15)", color: "#C9A227", border: "1px solid rgba(201,162,39,0.3)" }}>
                    {entry.type}
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "#A8B0B9" }}>{entry.content}</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-lg text-sm font-medium transition-all hover:bg-[rgba(201,162,39,0.15)]" style={{ background: "rgba(201,162,39,0.08)", color: "#C9A227", border: "1px solid rgba(201,162,39,0.15)" }}>
                    Edit
                  </button>
                  <button className="flex-1 py-2 rounded-lg text-sm font-medium transition-all hover:bg-[rgba(239,68,68,0.2)]" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
