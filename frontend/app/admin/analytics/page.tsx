import { PageHeader } from "@/components/common/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, MessageSquare, ArrowUpRight } from "lucide-react"

export default async function AnalyticsPage() {
  const metrics = [
    { label: "Total Orders", value: "1,234", change: "+12%", icon: BarChart3, color: "text-blue-600" },
    { label: "Active Customers", value: "456", change: "+8%", icon: Users, color: "text-green-600" },
    { label: "Avg Response Time", value: "2.3s", change: "-15%", icon: TrendingUp, color: "text-purple-600" },
    { label: "Chat Messages", value: "5,678", change: "+23%", icon: MessageSquare, color: "text-orange-600" },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Track customer engagement, order trends, and system performance."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} className="border-border/50 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </CardTitle>
                <div className={`rounded-lg bg-${metric.color.split('-')[1]}-100 p-2`}>
                  <Icon className={`size-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <ArrowUpRight className="size-3" />
                  {metric.change} from last month
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center rounded-lg border border-border/30 bg-background/50 text-muted-foreground">
            Chart visualization would appear here
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
