"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { Card } from "@/components/ui/card"

const REVIEWS = [
  {
    id: 1,
    name: "Ahmed Hassan",
    rating: 5,
    text: "Best biryani I've ever had! The quality and taste are exceptional. Highly recommend RoyalBite.",
    verified: true,
  },
  {
    id: 2,
    name: "Fatima Khan",
    rating: 5,
    text: "Amazing service and delicious food. The WhatsApp ordering is so convenient. Will order again!",
    verified: true,
  },
  {
    id: 3,
    name: "Hassan Ali",
    rating: 5,
    text: "Authentic Pakistani cuisine at its finest. Every dish is prepared with care and passion.",
    verified: true,
  },
]

export function Testimonials() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "linear-gradient(to bottom, #0D1117, rgba(13, 17, 23, 0.95))" }}>
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
          <p style={{ color: "#A8B0B9" }} className="text-lg">
            Hear from our satisfied customers
          </p>
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {REVIEWS.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                className="p-6 backdrop-blur-sm flex flex-col h-full"
                style={{
                  background: "rgba(22, 27, 34, 0.5)",
                  border: "1px solid rgba(201, 162, 39, 0.2)"
                }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" style={{ color: "#C9A227" }} />
                  ))}
                </div>

                {/* Review Text */}
                <p style={{ color: "#A8B0B9" }} className="text-sm mb-6 flex-grow">
                  "{review.text}"
                </p>

                {/* Author */}
                <div className="border-t" style={{ borderColor: "rgba(201, 162, 39, 0.2)" }}>
                  <div className="pt-4">
                    <p style={{ color: "#F8F5F0" }} className="font-playfair font-bold">
                      {review.name}
                    </p>
                    {review.verified && (
                      <p style={{ color: "#C9A227" }} className="text-xs">
                        ✓ Verified Customer
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}