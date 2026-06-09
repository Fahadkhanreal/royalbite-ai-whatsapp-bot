"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function AboutUs() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24" style={{ background: "linear-gradient(to bottom, #0A0A0A, rgba(13, 17, 23, 0.95))" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-4xl sm:text-5xl font-playfair font-bold mb-6"
              style={{ color: "#F8F5F0" }}
            >
              About RoyalBite
            </motion.h2>

            <motion.p
              className="text-lg font-bold mb-4"
              style={{ color: "#C9A227" }}
            >
              Established 2018
            </motion.p>

            <motion.p
              className="text-lg leading-relaxed mb-6"
              style={{ color: "#A8B0B9" }}
            >
              RoyalBite was founded with a simple mission: to bring authentic Pakistani cuisine to your table with premium quality and exceptional service. What started as a small family venture has grown into a beloved restaurant known for its dedication to culinary excellence.
            </motion.p>

            <motion.p
              className="text-lg leading-relaxed mb-8"
              style={{ color: "#A8B0B9" }}
            >
              Our chefs combine traditional recipes passed down through generations with modern culinary techniques to create dishes that delight the senses. Every ingredient is carefully selected, and every dish is prepared with love and attention to detail.
            </motion.p>

            <div className="space-y-4">
              <motion.div
                className="flex items-start space-x-4"
                whileHover={{ x: 8 }}
              >
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: "#C9A227" }} />
                <p style={{ color: "#A8B0B9" }}>
                  <span className="font-semibold" style={{ color: "#F8F5F0" }}>Quality First:</span> Premium ingredients sourced from trusted suppliers
                </p>
              </motion.div>

              <motion.div
                className="flex items-start space-x-4"
                whileHover={{ x: 8 }}
              >
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: "#C9A227" }} />
                <p style={{ color: "#A8B0B9" }}>
                  <span className="font-semibold" style={{ color: "#F8F5F0" }}>Expert Chefs:</span> Experienced culinary professionals with passion
                </p>
              </motion.div>

              <motion.div
                className="flex items-start space-x-4"
                whileHover={{ x: 8 }}
              >
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: "#C9A227" }} />
                <p style={{ color: "#A8B0B9" }}>
                  <span className="font-semibold" style={{ color: "#F8F5F0" }}>Customer Focus:</span> Your satisfaction is our top priority
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            className="relative h-96 rounded-lg overflow-hidden group cursor-pointer"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            style={{ border: "2px solid rgba(201, 162, 39, 0.3)" }}
            whileHover={{ borderColor: "#C9A227" }}
          >
            <motion.div
              className="absolute inset-0"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Image
                src="/about-us.jpg"
                alt="RoyalBite Restaurant"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

            {/* Golden corner accents on hover */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-transparent group-hover:border-[#C9A227] transition-all duration-500" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-transparent group-hover:border-[#C9A227] transition-all duration-500 delay-75" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-transparent group-hover:border-[#C9A227] transition-all duration-500 delay-100" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-transparent group-hover:border-[#C9A227] transition-all duration-500 delay-150" />

            {/* Shine effect on hover */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-gradient-to-r from-transparent via-white to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.8 }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}