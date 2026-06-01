import { Plus, Upload } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { listDocuments } from "@/lib/repositories/admin-data"
import { EmptyState } from "@/components/common/feedback-states"

export default async function DocumentsPage() {
  const documents = await listDocuments()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="RAG Documents"
          description="Upload and manage documents for the knowledge retrieval system."
        />
        <Button className="gap-2">
          <Upload className="size-4" />
          Upload Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          title="No documents uploaded"
          description="Upload PDF, text, or markdown files to enhance the AI's knowledge base."
        />
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="border-white/10 bg-card/80">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{doc.filename}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={doc.indexStatus === "indexed" ? "default" : "secondary"}>
                    {doc.indexStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{doc.fileSize} bytes</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Re-index
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1">
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
