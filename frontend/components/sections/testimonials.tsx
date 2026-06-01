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
  {
    id: 4,
    name: "Zainab Malik",
    rating: 5,
    text: "The karahi chicken is absolutely delicious. Fresh ingredients and perfect seasoning every time.",
    verified: true,
  },
  {
    id: 5,
    name: "Muhammad Saeed",
    rating: 5,
    text: "Excellent quality and fast delivery. RoyalBite has become my go-to restaurant for special occasions.",
    verified: true,
  },
]

export function Testimonials() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-royal-dark to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-royal-light mb-4">
            Customer Reviews
          </h2>
          <p className="text-royal-orange text-lg">
            What our satisfied customers say
          </p>
        </motion.div>

        {/* Reviews Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {REVIEWS.map((review) => (
            <motion.div key={review.id} variants={itemVariants}>
              <Card className="bg-slate-800/50 border-royal-red/20 p-6 hover-lift">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-royal-orange text-royal-orange"
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-royal-light/80 mb-4 leading-relaxed">
                  "{review.text}"
                </p>

                {/* Customer Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-royal-light">
                      {review.name}
                    </p>
                    {review.verified && (
                      <p className="text-xs text-royal-green">
                        ✓ Verified Customer
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
