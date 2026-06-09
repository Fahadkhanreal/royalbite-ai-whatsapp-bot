"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

interface GalleryImage {
  id: string
  src: string
  alt: string
}

export function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(3)

  useEffect(() => {
    fetch("/api/gallery")
      .then(res => res.json())
      .then(json => {
        setImages(json.data?.images || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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
    <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24" style={{ background: "linear-gradient(to bottom, #0A0A0A, rgba(13, 17, 23, 0.95))" }}>
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
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64 md:h-80 rounded-lg" style={{ background: "rgba(40,30,25,0.6)" }} />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: "#A8B0B9" }}>Gallery coming soon!</p>
          </div>
        ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {images.slice(0, visibleCount).map((image) => (
            <motion.div
              key={image.id}
              className="relative overflow-hidden rounded-lg group cursor-pointer"
              variants={itemVariants}
              style={{
                border: "1px solid rgba(201, 162, 39, 0.2)",
                background: "rgba(20, 15, 12, 0.4)"
              }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative h-64 md:h-80">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  loading="lazy"
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
        )}
        {/* Load More Button */}
        {visibleCount < images.length && (
          <motion.div className="text-center mt-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <button
              onClick={() => setVisibleCount(prev => Math.min(prev + 3, images.length))}
              className="px-8 py-3 rounded-xl text-sm font-playfair font-bold transition-all duration-300 hover:shadow-[0_0_40px_rgba(201,162,39,0.6)] hover:scale-[1.04]"
              style={{ background: "linear-gradient(135deg, #C9A227, #A67D1F)", color: "#0A0A0A", boxShadow: "0 0 20px rgba(201,162,39,0.3)" }}
            >
              Load More ({images.length - visibleCount} remaining)
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}