"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

interface Review {
  id: string
  name: string
  rating: number
  text: string
  status: string
}

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: "", rating: 5, text: "" })

  useEffect(() => {
    fetch("/api/reviews")
      .then(r => r.json())
      .then(json => setReviews(json.data?.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.text.trim()) {
      toast.error("Please fill in all fields")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success("Review submitted! Awaiting approval. 🎉")
      setForm({ name: "", rating: 5, text: "" })
      setShowForm(false)
    } catch {
      toast.error("Failed to submit review")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "linear-gradient(to bottom, #0A0A0A, rgba(13, 17, 23, 0.95))" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-playfair font-bold mb-4" style={{ color: "#F8F5F0" }}>
            What Our Guests Say
          </h2>
          <p style={{ color: "#A8B0B9" }} className="text-lg mb-6">
            Hear from our satisfied customers
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2.5 rounded-xl text-sm font-playfair font-bold transition-all hover:shadow-[0_0_30px_rgba(201,162,39,0.5)]"
            style={{ background: "linear-gradient(135deg, #C9A227, #A67D1F)", color: "#0A0A0A" }}
          >
            {showForm ? "Cancel" : "Write a Review ✍️"}
          </button>
        </motion.div>

        {/* Review Form */}
        {showForm && (
          <motion.div
            className="max-w-lg mx-auto mb-12 rounded-xl p-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: "rgba(20,15,12,0.6)", border: "1px solid rgba(201,162,39,0.2)" }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                placeholder="Your Name"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "rgba(10,10,10,0.6)", border: "1px solid rgba(201,162,39,0.2)", color: "#F8F5F0" }}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: "#A8B0B9" }}>Rating:</span>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => setForm(p => ({ ...p, rating: n }))}>
                    <Star className={`size-6 ${n <= form.rating ? "fill-current" : ""}`} style={{ color: n <= form.rating ? "#C9A227" : "#6B6560" }} />
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Your review..."
                value={form.text}
                onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "rgba(10,10,10,0.6)", border: "1px solid rgba(201,162,39,0.2)", color: "#F8F5F0" }}
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl font-playfair font-bold transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #C9A227, #A67D1F)", color: "#0A0A0A" }}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </motion.div>
        )}

        {/* Reviews Grid */}
        {loading ? (
          <div className="text-center py-12"><Loader2 className="size-8 mx-auto animate-spin" style={{ color: "#C9A227" }} /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: "#A8B0B9" }}>No reviews yet. Be the first to write one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 backdrop-blur-sm flex flex-col h-full" style={{ background: "rgba(20, 15, 12, 0.6)", border: "1px solid rgba(201, 162, 39, 0.2)" }}>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" style={{ color: "#C9A227" }} />
                    ))}
                  </div>
                  <p style={{ color: "#A8B0B9" }} className="text-sm mb-6 flex-grow">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <div className="border-t pt-4" style={{ borderColor: "rgba(201, 162, 39, 0.2)" }}>
                    <p style={{ color: "#F8F5F0" }} className="font-playfair font-bold">{review.name}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
