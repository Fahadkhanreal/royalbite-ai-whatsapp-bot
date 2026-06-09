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
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <Card key={stat.label} className="hover-lift card-hover animate-fadeInUp" style={{ borderColor: "rgba(201, 162, 39, 0.15)", background: "linear-gradient(135deg, rgba(20, 15, 12, 0.6), rgba(20, 15, 12, 0.3))", animationDelay: `${idx * 0.1}s` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium" style={{ color: "#A8B0B9" }}>{stat.label}</CardTitle>
              <div className="rounded-lg p-2" style={{ backgroundColor: "rgba(201, 162, 39, 0.1)" }}>
                <stat.icon className="size-4" style={{ color: "#C9A227" }} />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold" style={{ color: "#F8F5F0" }}>{stat.value}</div>
              <div className="flex items-center gap-1 text-xs" style={{ color: "#22C55E" }}>
                <TrendingUp className="size-3" />
                {stat.trend} from yesterday
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders & Popular Dishes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="hover-lift card-hover animate-slideInLeft" style={{ borderColor: "rgba(201, 162, 39, 0.15)", background: "linear-gradient(135deg, rgba(20, 15, 12, 0.6), rgba(20, 15, 12, 0.3))" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="size-5" style={{ color: "#C9A227" }} />
              <span style={{ color: "#F8F5F0" }}>Recent Orders</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.recentOrders.length === 0 ? (
              <p className="text-sm" style={{ color: "#A8B0B9" }}>No recent orders</p>
            ) : (
              summary.recentOrders.map((order, idx) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border p-3 transition-colors animate-fadeInUp" style={{ borderColor: "rgba(201, 162, 39, 0.1)", backgroundColor: "rgba(10, 10, 10, 0.4)", animationDelay: `${idx * 0.05}s` }}>
                  <div>
                    <p className="font-medium text-sm" style={{ color: "#F8F5F0" }}>{order.id}</p>
                    <p className="text-xs" style={{ color: "#A8B0B9" }}>{order.customerName}</p>
                  </div>
                  <Badge variant={(order.status as string) === "completed" ? "default" : "secondary"} className="text-xs">
                    {order.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="hover-lift card-hover animate-slideInRight" style={{ borderColor: "rgba(201, 162, 39, 0.15)", background: "linear-gradient(135deg, rgba(20, 15, 12, 0.6), rgba(20, 15, 12, 0.3))" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="size-5" style={{ color: "#C9A227" }} />
              <span style={{ color: "#F8F5F0" }}>Popular Dishes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.popularItems.length === 0 ? (
              <p className="text-sm" style={{ color: "#A8B0B9" }}>No popular items yet</p>
            ) : (
              summary.popularItems.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border p-3 transition-colors animate-fadeInUp" style={{ borderColor: "rgba(201, 162, 39, 0.1)", backgroundColor: "rgba(10, 10, 10, 0.4)", animationDelay: `${idx * 0.05}s` }}>
                  <div>
                    <p className="font-medium text-sm" style={{ color: "#F8F5F0" }}>{item.name}</p>
                    <p className="text-xs" style={{ color: "#A8B0B9" }}>{item.category}</p>
                  </div>
                  <span className="font-semibold" style={{ color: "#C9A227" }}>Rs. {item.price}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
