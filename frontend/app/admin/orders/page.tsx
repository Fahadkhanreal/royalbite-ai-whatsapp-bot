import { PageHeader } from "@/components/common/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { listOrders } from "@/lib/repositories/admin-data"
import { EmptyState } from "@/components/common/feedback-states"
import { ShoppingBag, Clock, CheckCircle } from "lucide-react"

export default async function OrdersPage() {
  const orders = await listOrders()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="size-4 text-green-600" />
      case "pending":
        return <Clock className="size-4 text-yellow-600" />
      default:
        return <ShoppingBag className="size-4 text-blue-600" />
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Orders Management"
        description="View and manage customer orders, update status, and track delivery."
      />

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Orders will appear here when customers place them via WhatsApp."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-border/50 bg-gradient-to-r from-card to-card/50 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <CardTitle className="text-lg">{order.id}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{order.customerName}</p>
                  </div>
                  <Badge variant={order.status === "completed" ? "default" : "secondary"} className="text-xs">
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Phone</p>
                    <p className="font-medium">{order.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Total</p>
                    <p className="font-bold text-primary">Rs. {order.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Items</p>
                    <p className="font-medium">3 items</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
