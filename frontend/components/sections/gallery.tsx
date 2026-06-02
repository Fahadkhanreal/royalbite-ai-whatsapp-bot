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
    <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "linear-gradient(to bottom, #0D1117, rgba(13, 17, 23, 0.95))" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-playfair font-bold mb-4" style={{ color: "#F8F5F0" }}>
            Gallery
          </h2>
          <p style={{ color: "#A8B0B9" }} className="text-lg">
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
          {GALLERY_IMAGES.map((image) => (
            <motion.div
              key={image.id}
              className="relative overflow-hidden rounded-lg group cursor-pointer"
              variants={itemVariants}
              style={{
                border: "1px solid rgba(201, 162, 39, 0.2)",
                background: "rgba(22, 27, 34, 0.3)"
              }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative h-64 md:h-80">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                  <p style={{ color: "#F8F5F0" }} className="font-playfair text-lg font-semibold">
                    {image.alt}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}