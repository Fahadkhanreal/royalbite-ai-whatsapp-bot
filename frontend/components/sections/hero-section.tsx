"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  }

  return (
    <section
      id="home"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-royal-dark via-slate-900 to-royal-dark"
    >
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/hero-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Restaurant Name */}
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-playfair font-bold text-royal-light mb-4 tracking-tight"
          variants={itemVariants}
        >
          RoyalBite
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-xl sm:text-2xl text-royal-orange font-semibold mb-6"
          variants={itemVariants}
        >
          Premium Pakistani & Continental Cuisine
        </motion.p>

        {/* Sub-heading */}
        <motion.p
          className="text-lg sm:text-xl text-royal-light/80 mb-12 max-w-2xl mx-auto leading-relaxed"
          variants={itemVariants}
        >
          Experience authentic flavors crafted with passion. Order now on WhatsApp or reserve your table for an unforgettable dining experience.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          variants={itemVariants}
        >
          <Button
            asChild
            className="bg-royal-red hover:bg-red-700 text-white px-8 py-6 text-lg rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-royal-red/50"
          >
            <a
              href="https://wa.me/923001234567?text=Hi%20RoyalBite%2C%20I%20want%20to%20order"
              target="_blank"
              rel="noopener noreferrer"
            >
              Order Now on WhatsApp
            </a>
          </Button>
          <Button
            variant="outline"
            className="border-2 border-royal-light text-royal-light hover:bg-royal-light/10 px-8 py-6 text-lg rounded-full font-semibold transition-all duration-300"
            onClick={() => {
              const element = document.getElementById("reservations")
              element?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            Reserve Table
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll Down Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-8 h-8 text-royal-orange animate-pulse" />
      </motion.div>
    </section>
  )
}
