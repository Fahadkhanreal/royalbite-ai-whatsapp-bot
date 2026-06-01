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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-royal-dark">
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
            Why Choose Us
          </h2>
          <p className="text-royal-orange text-lg">
            Excellence in every aspect of our service
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="bg-slate-800/50 border-royal-red/20 p-8 text-center hover-lift group">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-royal-red to-royal-orange rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-playfair font-bold text-royal-light mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-royal-light/70">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
