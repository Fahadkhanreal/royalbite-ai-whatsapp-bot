"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const DISHES = [
  {
    id: 1,
    name: "Biryani Royale",
    price: "Rs. 450",
    description: "Fragrant basmati rice with tender meat and aromatic spices",
    image: "/dishes/biryani.jpg",
  },
  {
    id: 2,
    name: "Karahi Chicken",
    price: "Rs. 380",
    description: "Succulent chicken cooked in traditional karahi with fresh herbs",
    image: "/dishes/karahi.jpg",
  },
  {
    id: 3,
    name: "Seekh Kebab",
    price: "Rs. 320",
    description: "Minced meat kebabs grilled to perfection with spices",
    image: "/dishes/seekh-kebab.jpg",
  },
]

export function FeaturedDishes() {
  return (
    <section id="menu" className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "linear-gradient(to bottom, rgba(13, 17, 23, 0.95), #0D1117)" }}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DISHES.map((dish, index) => (
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                className="overflow-hidden backdrop-blur-sm"
                style={{
                  background: "rgba(22, 27, 34, 0.5)",
                  border: "1px solid rgba(201, 162, 39, 0.2)"
                }}
              >
                <motion.div
                  className="relative h-48 overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                >
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </motion.div>

                <div className="p-6">
                  <h3 className="text-2xl font-playfair font-bold mb-2" style={{ color: "#F8F5F0" }}>
                    {dish.name}
                  </h3>
                  <p style={{ color: "#A8B0B9" }} className="text-sm mb-4">
                    {dish.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold" style={{ color: "#C9A227" }}>
                      {dish.price}
                    </span>
                    <Button
                      asChild
                      className="btn-gold"
                    >
                      <a href={`https://wa.me/923001234567?text=I%20want%20to%20order%20${dish.name}`} target="_blank" rel="noopener noreferrer">
                        Order
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Button
            asChild
            className="btn-outline-gold text-lg px-10 py-3"
          >
            <a href="#menu">View Full Menu</a>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}