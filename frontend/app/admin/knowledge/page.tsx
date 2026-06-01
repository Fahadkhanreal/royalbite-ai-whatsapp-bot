import { Plus } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { listKnowledgeEntries } from "@/lib/repositories/admin-data"
import { EmptyState } from "@/components/common/feedback-states"

export default async function KnowledgePage() {
  const entries = await listKnowledgeEntries()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Knowledge Base"
          description="Manage offers, policies, FAQs, and other customer-facing information."
        />
        <Button className="gap-2">
          <Plus className="size-4" />
          Add Entry
        </Button>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="No knowledge entries yet"
          description="Add offers, policies, and FAQs to help customers understand your restaurant."
        />
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="border-white/10 bg-card/80">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{entry.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{entry.category}</p>
                  </div>
                  <Badge variant="secondary">{entry.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{entry.content}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
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
