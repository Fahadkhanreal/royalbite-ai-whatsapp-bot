import { FloatingWhatsAppButton } from "@/components/common/floating-whatsapp-button"
import { EmptyState } from "@/components/common/feedback-states"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { listPublicMenuItems } from "@/lib/repositories/public-menu"

export default async function PublicMenuPage() {
  const items = await listPublicMenuItems()

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof items>)

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="border-b border-border/40 px-6 py-16">
        <div className="mx-auto max-w-6xl space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">RoyalBite Menu</p>
          <h1 className="text-4xl font-bold tracking-tight">Fresh favorites, verified prices.</h1>
          <p className="text-lg text-muted-foreground">Browse our read-only public menu. WhatsApp pe order confirm kar sakte hain.</p>
        </div>
      </section>

      {/* Menu Items */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          {items.length === 0 ? (
            <EmptyState title="Menu is being prepared" description="Please message us on WhatsApp for today’s available dishes." />
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <div key={category} className="space-y-4">
                  <h2 className="text-2xl font-bold text-primary">{category}</h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categoryItems.map((item) => (
                      <Card key={item.id} className="border-border/50 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-shadow overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs">Available</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                          <div className="flex items-center justify-between pt-2 border-t border-border/30">
                            <span className="text-2xl font-bold text-primary">Rs. {item.price}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <FloatingWhatsAppButton />
    </main>
  )
}
