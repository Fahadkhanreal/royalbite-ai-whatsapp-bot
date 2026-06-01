"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const MENU_CATEGORIES = [
  {
    id: 1,
    name: "Starters",
    description: "Appetizers and small bites",
    icon: "🥘",
  },
  {
    id: 2,
    name: "Main Course",
    description: "Signature meat and rice dishes",
    icon: "🍛",
  },
  {
    id: 3,
    name: "BBQ",
    description: "Grilled specialties",
    icon: "🔥",
  },
  {
    id: 4,
    name: "Desserts",
    description: "Sweet treats and traditional sweets",
    icon: "🍰",
  },
  {
    id: 5,
    name: "Beverages",
    description: "Drinks and refreshments",
    icon: "🥤",
  },
]

export function MenuPreview() {
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
            Our Menu
          </h2>
          <p className="text-royal-orange text-lg">
            Explore our diverse culinary offerings
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {MENU_CATEGORIES.map((category) => (
            <motion.div key={category.id} variants={itemVariants}>
              <Card className="bg-slate-800/50 border-royal-red/20 p-6 text-center hover-lift cursor-pointer">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-lg font-playfair font-bold text-royal-light mb-2">
                  {category.name}
                </h3>
                <p className="text-royal-light/70 text-sm">
                  {category.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* View Full Menu Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Button
            asChild
            className="bg-royal-orange hover:bg-orange-600 text-white px-8 py-6 text-lg rounded-full font-semibold"
          >
            <a href="/menu">View Full Menu</a>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
