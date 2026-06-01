import { Plus } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { listMenuItems } from "@/lib/repositories/admin-data"
import { EmptyState } from "@/components/common/feedback-states"

export default async function MenuPage() {
  const items = await listMenuItems()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Menu Management"
          description="Add, edit, or remove dishes from your restaurant menu."
        />
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="size-4" />
          Add Dish
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No menu items yet"
          description="Start by adding your first dish to the menu."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="border-border/50 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-shadow overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
                  </div>
                  <Badge variant={item.availability === "available" ? "default" : "secondary"} className="text-xs">
                    {item.availability}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <span className="text-2xl font-bold text-primary">Rs. {item.price}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="text-xs">
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
