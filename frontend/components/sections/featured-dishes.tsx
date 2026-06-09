"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { WHATSAPP_NUMBER } from "@/lib/constants"

interface Dish {
  id: string
  name: string
  description: string
  price: string | number
  category: string
  image_url?: string
  is_available?: boolean
}

export function FeaturedDishes() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)

  const apiBase = ""

  useEffect(() => {
    fetch(`${apiBase}/api/menu?featured=true`)
      .then(res => res.json())
      .then(json => {
        const data = json.data?.dishes || json.dishes || json || []
        setDishes(data.slice(0, 6))
      })
      .catch(() => {
        // fallback: silent
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="menu" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24" style={{ background: "linear-gradient(to bottom, rgba(10, 10, 10, 0.95), #0A0A0A)" }}>
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
            Featured Dishes
          </h2>
          <p style={{ color: "#A8B0B9" }} className="text-lg">
            Try our most popular and beloved dishes
          </p>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ background: "rgba(20, 15, 12, 0.6)", border: "1px solid rgba(201, 162, 39, 0.2)" }}>
                <Skeleton className="w-full aspect-[4/3] rounded-none" style={{ background: "rgba(40, 30, 25, 0.6)" }} />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" style={{ background: "rgba(40, 30, 25, 0.6)" }} />
                  <Skeleton className="h-4 w-full" style={{ background: "rgba(40, 30, 25, 0.6)" }} />
                  <Skeleton className="h-4 w-2/3" style={{ background: "rgba(40, 30, 25, 0.6)" }} />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-7 w-20" style={{ background: "rgba(40, 30, 25, 0.6)" }} />
                    <Skeleton className="h-9 w-20 rounded" style={{ background: "rgba(40, 30, 25, 0.6)" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : dishes.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: "#A8B0B9" }}>No dishes available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dishes.map((dish, index) => (
              <motion.div
                key={dish.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className="overflow-hidden backdrop-blur-sm h-full"
                  style={{
                    background: "rgba(20, 15, 12, 0.6)",
                    border: "1px solid rgba(201, 162, 39, 0.2)"
                  }}
                >
                  <motion.div
                    className="relative w-full overflow-hidden"
                    style={{ aspectRatio: "4 / 3" }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Image
                      src={(dish as any).imageUrl || dish.image_url || `/dishes/${dish.name.toLowerCase().replace(/\s+/g, "-")}.jpg`}
                      alt={dish.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </motion.div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-2xl font-playfair font-bold mb-2" style={{ color: "#F8F5F0" }}>
                      {dish.name}
                    </h3>
                    <p style={{ color: "#A8B0B9" }} className="text-sm mb-4 flex-grow">
                      {dish.description}
                    </p>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-xl font-bold" style={{ color: "#C9A227" }}>
                        Rs. {typeof dish.price === "number" ? dish.price : parseFloat(String(dish.price || 0)).toFixed(0)}
                      </span>
                      <a
                        href={`https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=I%20want%20to%20order%20${dish.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-gold text-sm px-6 py-2 rounded"
                      >
                        Order
                      </a>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <a href="/menu" className="btn-outline-gold text-lg px-10 py-3 inline-block rounded">
            View Full Menu
          </a>
        </motion.div>
      </div>
    </section>
  )
}
