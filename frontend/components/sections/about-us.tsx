"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function AboutUs() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-royal-dark to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-royal-light mb-6">
              About RoyalBite
            </h2>
            <p className="text-royal-orange text-lg font-semibold mb-4">
              Established 2018
            </p>
            <p className="text-royal-light/80 text-lg leading-relaxed mb-6">
              RoyalBite was founded with a simple mission: to bring authentic Pakistani cuisine to your table with premium quality and exceptional service. What started as a small family venture has grown into a beloved restaurant known for its dedication to culinary excellence.
            </p>
            <p className="text-royal-light/80 text-lg leading-relaxed mb-6">
              Our chefs combine traditional recipes passed down through generations with modern culinary techniques to create dishes that delight the senses. Every ingredient is carefully selected, and every dish is prepared with love and attention to detail.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-royal-orange rounded-full mt-2 flex-shrink-0" />
                <p className="text-royal-light/80">
                  <span className="font-semibold text-royal-light">Quality First:</span> Premium ingredients sourced from trusted suppliers
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-royal-orange rounded-full mt-2 flex-shrink-0" />
                <p className="text-royal-light/80">
                  <span className="font-semibold text-royal-light">Expert Chefs:</span> Experienced culinary professionals with passion for cooking
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-royal-orange rounded-full mt-2 flex-shrink-0" />
                <p className="text-royal-light/80">
                  <span className="font-semibold text-royal-light">Customer Focus:</span> Your satisfaction is our top priority
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Image */}
          <motion.div
            className="relative h-96 rounded-lg overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Image
              src="/about-us.jpg"
              alt="RoyalBite Restaurant"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
