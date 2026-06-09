"use client"

import { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/common/page-header"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/common/feedback-states"
import { ShoppingBag, Clock, CheckCircle, Trash2, XCircle, ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "sonner"

interface OrderItem {
  menuItemId: string
  name: string
  quantity: number
  unitPrice: number
}

interface Order {
  id: string
  customerName: string
  customerPhone: string
  customerAddress?: string
  items: OrderItem[]
  totalAmount: number
  status: string
  createdAt: string
  updatedAt: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders")
      const json = await res.json()
      const data = json.data?.orders || json.orders || json || []
      setOrders(data)
    } catch {
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdatingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.message || "Failed to update")
      }
      toast.success(`Order ${newStatus}!`)
      await fetchOrders()
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    } finally {
      setUpdatingId(null)
    }
  }

  async function deleteOrder(orderId: string) {
    if (!confirm("Delete this order permanently?")) return
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Order deleted")
      await fetchOrders()
    } catch {
      toast.error("Failed to delete order")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
        return <CheckCircle className="size-4" style={{ color: "#22C55E" }} />
      case "cancelled":
        return <XCircle className="size-4" style={{ color: "#EF4444" }} />
      case "pending":
        return <Clock className="size-4" style={{ color: "#FF9F1C" }} />
      default:
        return <ShoppingBag className="size-4" style={{ color: "#C9A227" }} />
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "delivered":
      case "completed":
        return { bg: "rgba(34,197,94,0.15)", color: "#22C55E", border: "rgba(34,197,94,0.3)" }
      case "cancelled":
        return { bg: "rgba(239,68,68,0.15)", color: "#EF4444", border: "rgba(239,68,68,0.3)" }
      case "pending":
        return { bg: "rgba(255,159,28,0.15)", color: "#FF9F1C", border: "rgba(255,159,28,0.3)" }
      default:
        return { bg: "rgba(201,162,39,0.15)", color: "#C9A227", border: "rgba(201,162,39,0.3)" }
    }
  }

  const STATUS_ACTIONS = [
    { label: "Confirm", status: "confirmed", color: "#22C55E" },
    { label: "Preparing", status: "preparing", color: "#C9A227" },
    { label: "Delivered", status: "delivered", color: "#3B82F6" },
    { label: "Cancel", status: "cancelled", color: "#EF4444" },
  ]

  return (
    <div className="space-y-8">
      <PageHeader title="Orders Management" description="View and manage customer orders, update status, and track delivery." />

      {loading ? (
        <div className="text-center py-20"><p style={{ color: "#A8B0B9" }}>Loading orders...</p></div>
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Orders will appear here when customers place them via WhatsApp." />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const ss = getStatusStyle(order.status)
            const isExpanded = expandedId === order.id
            return (
              <div key={order.id} className="rounded-xl transition-all duration-300"
                style={{ background: "rgba(20,15,12,0.6)", border: "1px solid rgba(201,162,39,0.12)", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>

                {/* Header Row */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(order.status)}
                        <h3 className="text-lg font-playfair font-bold" style={{ color: "#F8F5F0" }}>Order #{order.id}</h3>
                      </div>
                      <p className="text-sm" style={{ color: "#A8B0B9" }}>{order.customerName} — {order.customerPhone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                        {order.status}
                      </span>
                      <button onClick={() => deleteOrder(order.id)}
                        className="p-2 rounded-lg transition-all hover:bg-[rgba(239,68,68,0.2)]"
                        style={{ color: "#EF4444", background: "rgba(239,68,68,0.08)" }}>
                        <Trash2 className="size-4" />
                      </button>
                      <button onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        className="p-2 rounded-lg transition-all hover:bg-[rgba(201,162,39,0.15)]"
                        style={{ color: "#C9A227", background: "rgba(201,162,39,0.08)" }}>
                        {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Summary Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm p-3 rounded-lg" style={{ background: "rgba(10,10,10,0.4)" }}>
                    <div>
                      <p className="text-xs" style={{ color: "#6B6560" }}>Phone</p>
                      <p className="font-medium text-sm" style={{ color: "#F8F5F0" }}>{order.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "#6B6560" }}>Total</p>
                      <p className="font-bold" style={{ color: "#C9A227" }}>Rs. {order.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "#6B6560" }}>Items</p>
                      <p className="font-medium text-sm" style={{ color: "#F8F5F0" }}>{order.items.length} items</p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "#6B6560" }}>Date</p>
                      <p className="font-medium text-sm" style={{ color: "#F8F5F0" }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4" style={{ borderTop: "1px solid rgba(201,162,39,0.08)" }}>
                    {/* Items List */}
                    {order.items.length > 0 && (
                      <div className="pt-4">
                        <p className="text-sm font-semibold mb-2" style={{ color: "#F8F5F0" }}>Order Items</p>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg" style={{ background: "rgba(10,10,10,0.4)" }}>
                              <div>
                                <span className="text-sm font-medium" style={{ color: "#F8F5F0" }}>{item.name}</span>
                                <span className="text-xs ml-2" style={{ color: "#6B6560" }}>x{item.quantity}</span>
                              </div>
                              <span className="text-sm" style={{ color: "#C9A227" }}>Rs. {item.unitPrice * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Actions */}
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: "#F8F5F0" }}>Update Status</p>
                      <div className="flex flex-wrap gap-2">
                        {STATUS_ACTIONS.map((action) => (
                          <button
                            key={action.status}
                            onClick={() => updateStatus(order.id, action.status)}
                            disabled={updatingId === order.id || order.status === action.status}
                            className="px-4 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
                            style={{
                              background: order.status === action.status ? `${action.color}25` : `${action.color}10`,
                              color: action.color,
                              border: `1px solid ${action.color}30`,
                            }}
                          >
                            {updatingId === order.id ? "..." : action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
