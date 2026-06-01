import { Clock, MessageCircle, ShoppingBag, Utensils, TrendingUp } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getDashboardSummary } from "@/lib/repositories/admin-data"

export default async function AdminDashboardPage() {
  const summary = await getDashboardSummary()

  const stats = [
    { label: "Orders Today", value: summary.todayOrders, icon: ShoppingBag, trend: "+12%" },
    { label: "Pending Orders", value: summary.pendingOrders, icon: Clock, trend: "-5%" },
    { label: "Popular Dishes", value: summary.popularItems.length, icon: Utensils, trend: "+8%" },
    { label: "Knowledge Items", value: summary.knowledgeStatus.publishedEntries, icon: MessageCircle, trend: "+3%" },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Assalamualaikum! Track RoyalBite operations, recent orders, and customer-answering knowledge from here."
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <Card key={stat.label} className="border-border/50 bg-gradient-to-br from-card to-card/50 hover-lift card-hover animate-fadeInUp" style={{animationDelay: `${idx * 0.1}s`}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <div className="rounded-lg bg-primary/10 p-2">
                <stat.icon className="size-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="size-3" />
                {stat.trend} from yesterday
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders & Popular Dishes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 hover-lift card-hover animate-slideInLeft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="size-5 text-primary" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent orders</p>
            ) : (
              summary.recentOrders.map((order, idx) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-3 hover:bg-background transition-colors animate-fadeInUp" style={{animationDelay: `${idx * 0.05}s`}}>
                  <div>
                    <p className="font-medium text-sm">{order.id}</p>
                    <p className="text-xs text-muted-foreground">{order.customerName}</p>
                  </div>
                  <Badge variant={order.status === "completed" ? "default" : "secondary"} className="text-xs">
                    {order.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 hover-lift card-hover animate-slideInRight">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="size-5 text-primary" />
              Popular Dishes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.popularItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No popular items yet</p>
            ) : (
              summary.popularItems.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-3 hover:bg-background transition-colors animate-fadeInUp" style={{animationDelay: `${idx * 0.05}s`}}>
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                  <span className="font-semibold text-primary">Rs. {item.price}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
