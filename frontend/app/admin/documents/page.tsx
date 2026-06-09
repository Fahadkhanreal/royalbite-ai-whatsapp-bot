import { Upload, FileText } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Badge } from "@/components/ui/badge"
import { listRagDocuments as listDocuments } from "@/lib/repositories/admin-data"
import { EmptyState } from "@/components/common/feedback-states"

export default async function DocumentsPage() {
  const documents = await listDocuments()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader title="RAG Documents" description="Upload and manage documents for the knowledge retrieval system." />
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-playfair font-bold transition-all duration-300 hover:shadow-[0_0_40px_rgba(201,162,39,0.6)] hover:scale-[1.04]"
          style={{ background: "linear-gradient(135deg, #C9A227, #A67D1F)", color: "#0A0A0A", boxShadow: "0 0 20px rgba(201,162,39,0.3)" }}>
          <Upload className="size-4" /> Upload Document
        </button>
      </div>

      {documents.length === 0 ? (
        <EmptyState title="No documents uploaded" description="Upload PDF, text, or markdown files to enhance the AI's knowledge base." />
      ) : (
        <div className="space-y-4">
          {documents.map((doc: any) => (
            <div key={doc.id} className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: "rgba(20,15,12,0.6)", border: "1px solid rgba(201,162,39,0.12)", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "linear-gradient(90deg, transparent, #C9A227, transparent)" }} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ background: "rgba(201,162,39,0.1)" }}>
                      <FileText className="size-5" style={{ color: "#C9A227" }} />
                    </div>
                    <div>
                      <h3 className="font-playfair font-bold" style={{ color: "#F8F5F0" }}>{doc.fileName || "Document"}</h3>
                      <p className="text-xs" style={{ color: "#6B6560" }}>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "N/A"}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)" }}>
                    {doc.status || "indexed"}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 py-2 rounded-lg text-sm font-medium transition-all hover:bg-[rgba(201,162,39,0.15)]" style={{ background: "rgba(201,162,39,0.08)", color: "#C9A227", border: "1px solid rgba(201,162,39,0.15)" }}>
                    Re-index
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
