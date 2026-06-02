"use client"

import { motion } from "framer-motion"
import { Leaf, Users, Zap, Heart } from "lucide-react"
import { Card } from "@/components/ui/card"

const FEATURES = [
  {
    icon: Leaf,
    title: "Fresh Ingredients",
    description: "Premium quality ingredients sourced daily from trusted suppliers",
  },
  {
    icon: Users,
    title: "Master Chefs",
    description: "Experienced culinary experts with passion for authentic cuisine",
  },
  {
    icon: Zap,
    title: "Fast Delivery",
    description: "Quick WhatsApp ordering and efficient delivery to your doorstep",
  },
  {
    icon: Heart,
    title: "Family Atmosphere",
    description: "Warm hospitality and welcoming environment for all guests",
  },
]

export function WhyChooseUs() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "linear-gradient(to bottom, rgba(13, 17, 23, 0.95), #0D1117)" }}>
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
            Why Choose RoyalBite
          </h2>
          <p style={{ color: "#A8B0B9" }} className="text-lg">
            Experience excellence in every aspect
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className="p-6 backdrop-blur-sm"
                  style={{
                    background: "rgba(22, 27, 34, 0.5)",
                    border: "1px solid rgba(201, 162, 39, 0.2)"
                  }}
                >
                  <motion.div whileHover={{ scale: 1.1 }} className="mb-4">
                    <Icon className="w-12 h-12" style={{ color: "#C9A227" }} />
                  </motion.div>

                  <h3 className="text-xl font-playfair font-bold mb-3" style={{ color: "#F8F5F0" }}>
                    {feature.title}
                  </h3>

                  <p style={{ color: "#A8B0B9" }} className="text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}