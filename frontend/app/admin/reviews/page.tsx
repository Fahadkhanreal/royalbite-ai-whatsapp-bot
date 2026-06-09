"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Check, X, Star, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { toast } from "sonner"

interface Review {
  id: string
  name: string
  rating: number
  text: string
  status: string
  createdAt: string
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  async function fetchReviews() {
    try {
      const res = await fetch("/api/admin/reviews")
      const json = await res.json()
      setReviews(json.data?.reviews || [])
    } catch {
      toast.error("Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}&status=${status}`, { method: "PUT" })
      if (!res.ok) throw new Error()
      toast.success(`Review ${status}!`)
      await fetchReviews()
    } catch {
      toast.error("Failed to update review")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this review?")) return
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Review deleted")
      await fetchReviews()
    } catch {
      toast.error("Failed to delete review")
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Reviews" description="Approve, reject, or manage customer reviews." />
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="animate-pulse h-32 rounded-xl" style={{ background: "rgba(40,30,25,0.6)" }} />)}</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Reviews" description="Approve, reject, or manage customer reviews." />

      {reviews.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ background: "rgba(20,15,12,0.6)", border: "1px solid rgba(201,162,39,0.12)" }}>
          <p className="font-playfair font-bold text-xl mb-2" style={{ color: "#F8F5F0" }}>No reviews yet</p>
          <p style={{ color: "#A8B0B9" }} className="text-sm">Customer reviews will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-5 transition-all"
              style={{ background: "rgba(20,15,12,0.6)", border: "1px solid rgba(201,162,39,0.12)" }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-playfair font-bold" style={{ color: "#F8F5F0" }}>{review.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      review.status === "approved" ? "bg-[rgba(34,197,94,0.15)] text-[#22C55E]" :
                      review.status === "rejected" ? "bg-[rgba(239,68,68,0.15)] text-[#EF4444]" :
                      "bg-[rgba(255,159,28,0.15)] text-[#FF9F1C]"
                    }`} style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                      {review.status}
                    </span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="size-4 fill-current" style={{ color: "#C9A227" }} />
                    ))}
                  </div>
                  <p className="text-sm" style={{ color: "#A8B0B9" }}>&ldquo;{review.text}&rdquo;</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: "1px solid rgba(201,162,39,0.08)" }}>
                {review.status !== "approved" && (
                  <button onClick={() => updateStatus(review.id, "approved")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all hover:bg-[rgba(34,197,94,0.2)]"
                    style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <Check className="size-3.5" /> Approve
                  </button>
                )}
                {review.status !== "rejected" && (
                  <button onClick={() => updateStatus(review.id, "rejected")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all hover:bg-[rgba(239,68,68,0.2)]"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <X className="size-3.5" /> Reject
                  </button>
                )}
                <button onClick={() => handleDelete(review.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all hover:bg-[rgba(239,68,68,0.2)] ml-auto"
                  style={{ background: "rgba(100,100,100,0.1)", color: "#A8B0B9", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Trash2 className="size-3.5" /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
