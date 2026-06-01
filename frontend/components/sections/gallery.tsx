"use client"

import { motion } from "framer-motion"
import Image from "next/image"

const GALLERY_IMAGES = [
  { id: 1, src: "/gallery/dish-1.jpg", alt: "Biryani" },
  { id: 2, src: "/gallery/dish-2.jpg", alt: "Karahi" },
  { id: 3, src: "/gallery/dish-3.jpg", alt: "Kebab" },
  { id: 4, src: "/gallery/restaurant-1.jpg", alt: "Restaurant Interior" },
  { id: 5, src: "/gallery/dish-4.jpg", alt: "Nihari" },
  { id: 6, src: "/gallery/restaurant-2.jpg", alt: "Dining Area" },
  { id: 7, src: "/gallery/dish-5.jpg", alt: "Tikka Masala" },
  { id: 8, src: "/gallery/dish-6.jpg", alt: "Haleem" },
  { id: 9, src: "/gallery/restaurant-3.jpg", alt: "Kitchen" },
]

export function Gallery() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
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
            Gallery
          </h2>
          <p className="text-royal-orange text-lg">
            Visual journey through our culinary creations
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {GALLERY_IMAGES.map((image, index) => (
            <motion.div
              key={image.id}
              variants={itemVariants}
              className={`relative overflow-hidden rounded-lg group cursor-pointer ${
                index === 0 || index === 4 ? "md:col-span-1 md:row-span-2" : ""
              }`}
              style={{
                height: index === 0 || index === 4 ? "400px" : "250px",
              }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
