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
  {
    id: 4,
    name: "Nihari",
    price: "Rs. 400",
    description: "Slow-cooked meat stew with rich, aromatic gravy",
    image: "/dishes/nihari.jpg",
  },
  {
    id: 5,
    name: "Tikka Masala",
    price: "Rs. 420",
    description: "Tender chicken tikka in creamy tomato-based sauce",
    image: "/dishes/tikka-masala.jpg",
  },
  {
    id: 6,
    name: "Haleem",
    price: "Rs. 350",
    description: "Traditional slow-cooked meat and lentil delicacy",
    image: "/dishes/haleem.jpg",
  },
]

export function FeaturedDishes() {
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
    <section id="menu" className="py-20 px-4 sm:px-6 lg:px-8 bg-royal-dark">
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
            Featured Dishes
          </h2>
          <p className="text-royal-orange text-lg">
            Signature dishes crafted with passion
          </p>
        </motion.div>

        {/* Dishes Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {DISHES.map((dish) => (
            <motion.div key={dish.id} variants={itemVariants}>
              <Card className="bg-slate-800/50 border-royal-red/20 overflow-hidden hover-lift group">
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-playfair font-bold text-royal-light mb-2">
                    {dish.name}
                  </h3>
                  <p className="text-royal-orange font-semibold mb-3">
                    {dish.price}
                  </p>
                  <p className="text-royal-light/70 text-sm mb-4">
                    {dish.description}
                  </p>
                  <Button
                    asChild
                    className="w-full bg-royal-green hover:bg-green-600 text-white rounded-full"
                  >
                    <a
                      href={`https://wa.me/923001234567?text=I%20want%20to%20order%20${dish.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Order Now
                    </a>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
