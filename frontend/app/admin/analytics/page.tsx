"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/common/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, ShoppingBag, Clock, CheckCircle, XCircle, Star } from "lucide-react"

interface AnalyticsData {
  period: string
  metrics: {
    totalOrders: number
    totalRevenue: number
    avgOrderValue: number
    statusBreakdown: {
      pending: number
      confirmed: number
      preparing: number
      delivered: number
      cancelled: number
    }
  }
  popularItems: Array<{ name: string; count: number }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("all")

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/analytics?period=${period}`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) setData(json.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [period])

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Analytics" description="Track customer engagement, order trends, and system performance." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 animate-pulse rounded-xl" style={{ background: "rgba(40,30,25,0.6)" }} />
          ))}
        </div>
      </div>
    )
  }

  const metrics = data ? [
    { label: "Total Orders", value: data.metrics.totalOrders.toString(), icon: ShoppingBag, change: `${data.metrics.statusBreakdown.delivered} delivered` },
    { label: "Total Revenue", value: `Rs. ${data.metrics.totalRevenue.toLocaleString()}`, icon: TrendingUp, change: data.metrics.totalOrders > 0 ? `Avg Rs. ${data.metrics.avgOrderValue}` : "No data" },
    { label: "Pending Orders", value: data.metrics.statusBreakdown.pending.toString(), icon: Clock, change: `${data.metrics.statusBreakdown.confirmed} confirmed` },
    { label: "Cancelled", value: data.metrics.statusBreakdown.cancelled.toString(), icon: XCircle, change: data.metrics.totalOrders > 0 ? `${Math.round(data.metrics.statusBreakdown.cancelled / data.metrics.totalOrders * 100)}% rate` : "—" },
  ] : []

  const statusColors: Record<string, string> = {
    pending: "#FF9F1C",
    confirmed: "#3B82F6",
    preparing: "#C9A227",
    delivered: "#22C55E",
    cancelled: "#EF4444",
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader title="Analytics" description="Track customer engagement, order trends, and system performance." />
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:border-[#C9A227]"
          style={{ background: "rgba(10,10,10,0.6)", border: "1px solid rgba(201,162,39,0.2)", color: "#F8F5F0" }}
        >
          <option value="all" style={{ background: "#1A1110" }}>All Time</option>
          <option value="month" style={{ background: "#1A1110" }}>Last 30 Days</option>
          <option value="week" style={{ background: "#1A1110" }}>Last 7 Days</option>
          <option value="today" style={{ background: "#1A1110" }}>Today</option>
        </select>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {metrics.map((stat, idx) => (
          <Card key={stat.label} className="animate-fadeInUp" style={{ borderColor: "rgba(201, 162, 39, 0.15)", background: "linear-gradient(135deg, rgba(20, 15, 12, 0.6), rgba(20, 15, 12, 0.3))", animationDelay: `${idx * 0.1}s` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium" style={{ color: "#A8B0B9" }}>{stat.label}</CardTitle>
              <div className="rounded-lg p-2" style={{ backgroundColor: "rgba(201, 162, 39, 0.1)" }}>
                <stat.icon className="size-4" style={{ color: "#C9A227" }} />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold" style={{ color: "#F8F5F0" }}>{stat.value}</div>
              <div className="text-xs" style={{ color: "#A8B0B9" }}>{stat.change}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card style={{ borderColor: "rgba(201, 162, 39, 0.15)", background: "linear-gradient(135deg, rgba(20, 15, 12, 0.6), rgba(20, 15, 12, 0.3))" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5" style={{ color: "#C9A227" }} />
              <span style={{ color: "#F8F5F0" }}>Order Status Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data ? (
              <div className="space-y-3">
                {Object.entries(data.metrics.statusBreakdown).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: "rgba(10,10,10,0.4)" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColors[status] || "#A8B0B9" }} />
                      <span className="text-sm capitalize" style={{ color: "#F8F5F0" }}>{status}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold" style={{ color: "#C9A227" }}>{count}</span>
                      <span className="text-xs" style={{ color: "#6B6560" }}>
                        {data.metrics.totalOrders > 0 ? `${Math.round(count / data.metrics.totalOrders * 100)}%` : "—"}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 mt-2" style={{ borderTop: "1px solid rgba(201,162,39,0.1)" }}>
                  <span className="text-sm font-semibold" style={{ color: "#F8F5F0" }}>Total</span>
                  <span className="text-sm font-bold" style={{ color: "#C9A227" }}>{data.metrics.totalOrders}</span>
                </div>
              </div>
            ) : (
              <p style={{ color: "#A8B0B9" }} className="text-sm">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Popular Items */}
        <Card style={{ borderColor: "rgba(201, 162, 39, 0.15)", background: "linear-gradient(135deg, rgba(20, 15, 12, 0.6), rgba(20, 15, 12, 0.3))" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="size-5" style={{ color: "#C9A227" }} />
              <span style={{ color: "#F8F5F0" }}>Popular Items</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data && data.popularItems.length > 0 ? (
              <div className="space-y-3">
                {data.popularItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: "rgba(10,10,10,0.4)" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold w-5" style={{ color: "#C9A227" }}>#{idx + 1}</span>
                      <span className="text-sm" style={{ color: "#F8F5F0" }}>{item.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{item.count} orders</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p style={{ color: "#A8B0B9" }} className="text-sm">No popular items data yet</p>
                <p style={{ color: "#6B6560" }} className="text-xs mt-1">Will appear once orders are placed</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
