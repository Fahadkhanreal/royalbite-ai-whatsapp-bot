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
            Our Menu
          </h2>
          <p style={{ color: "#A8B0B9" }} className="text-lg">
            Explore our diverse culinary offerings
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {MENU_CATEGORIES.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                className="p-6 backdrop-blur-sm cursor-pointer h-full"
                style={{
                  background: "rgba(22, 27, 34, 0.5)",
                  border: "1px solid rgba(201, 162, 39, 0.2)"
                }}
              >
                <motion.div whileHover={{ scale: 1.1 }} className="text-5xl mb-4">
                  {category.icon}
                </motion.div>

                <h3 className="text-2xl font-playfair font-bold mb-2" style={{ color: "#F8F5F0" }}>
                  {category.name}
                </h3>

                <p style={{ color: "#A8B0B9" }} className="text-sm mb-6">
                  {category.description}
                </p>

                <Button
                  asChild
                  className="btn-gold w-full"
                >
                  <a href="#menu">Explore</a>
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Button
            asChild
            className="btn-outline-gold text-lg px-10 py-3"
          >
            <a href="https://wa.me/923001234567?text=Send%20me%20the%20full%20menu">
              Get Full Menu
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}