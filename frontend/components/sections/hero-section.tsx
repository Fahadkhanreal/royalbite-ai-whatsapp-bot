"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  }

  return (
    <section
      id="home"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#0D1117" }}
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/hero-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(13, 17, 23, 0.85) 0%, rgba(13, 17, 23, 0.95) 50%, rgba(13, 17, 23, 0.9) 100%)"
          }}
        />

        {/* Glows */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ background: "rgba(201, 162, 39, 0.08)" }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ background: "rgba(15, 61, 62, 0.06)", animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top Badge */}
        <motion.div
          className="mb-8 flex justify-center"
          variants={itemVariants}
        >
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full backdrop-blur-sm" style={{ border: "1.5px solid #C9A227", background: "rgba(201, 162, 39, 0.08)" }}>
            <span style={{ color: "#C9A227" }} className="text-xs font-playfair tracking-[0.3em] uppercase font-bold">
              Premium Pakistani Cuisine
            </span>
          </div>
        </motion.div>

        {/* R Logo */}
        <motion.div
          className="mb-10 flex justify-center"
          variants={itemVariants}
        >
          <motion.div
            className="w-32 h-32 rounded-3xl flex items-center justify-center font-bold text-7xl relative overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, #C9A227, #A67D1F)",
              boxShadow: "0 0 50px rgba(201, 162, 39, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.15)"
            }}
            whileHover={{
              boxShadow: "0 0 80px rgba(201, 162, 39, 1), inset 0 0 40px rgba(255, 255, 255, 0.25)"
            }}
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
            <span className="relative z-10" style={{ color: "#0D1117" }}>R</span>
          </motion.div>
        </motion.div>

        {/* RoyalBite */}
        <motion.h1
          className="text-7xl sm:text-8xl lg:text-9xl font-playfair font-bold mb-8 tracking-tighter leading-tight"
          variants={itemVariants}
          style={{ color: "#F8F5F0" }}
        >
          RoyalBite
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-2xl sm:text-3xl font-playfair mb-10 tracking-wide font-semibold"
          variants={itemVariants}
          style={{ color: "#C9A227" }}
        >
          Taste the Royalty
        </motion.p>

        {/* Description */}
        <motion.div
          className="max-w-3xl mx-auto mb-12"
          variants={itemVariants}
        >
          <p className="text-lg sm:text-xl leading-relaxed mb-4" style={{ color: "#A8B0B9" }}>
            Experience exquisite premium Pakistani delicacies crafted with passion by award-winning master chefs. Every dish is a masterpiece of heritage, tradition, and culinary excellence.
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="flex justify-center items-center gap-4 mb-14"
          variants={itemVariants}
        >
          <div className="h-px w-16" style={{ background: "linear-gradient(to right, transparent, #C9A227)" }}></div>
          <motion.div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#C9A227" }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="h-px w-16" style={{ background: "linear-gradient(to left, transparent, #C9A227)" }}></div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-8 justify-center items-center"
          variants={itemVariants}
        >
          <motion.a
            href="https://wa.me/923001234567?text=Hi%20RoyalBite%2C%20I%20want%20to%20order"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full sm:w-auto px-14 py-6 rounded-xl font-bold text-lg overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #C9A227, #A67D1F)",
              color: "#0D1117",
              boxShadow: "0 0 30px rgba(201, 162, 39, 0.4)"
            }}
            whileHover={{
              scale: 1.12,
              boxShadow: "0 0 70px rgba(201, 162, 39, 0.9)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute -inset-1 rounded-xl opacity-0 blur"
              style={{ background: "linear-gradient(135deg, #C9A227, #A67D1F)" }}
              whileHover={{ opacity: 0.5 }}
              transition={{ duration: 0.3 }}
            />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-white transition-opacity duration-300 transform -skew-x-12 group-hover:translate-x-full"></div>
            <span className="relative flex items-center justify-center gap-3 font-playfair z-10">
              <motion.span
                className="text-2xl"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                📱
              </motion.span>
              Order on WhatsApp
            </span>
          </motion.a>

          <motion.button
            onClick={() => {
              const element = document.getElementById("reservations")
              element?.scrollIntoView({ behavior: "smooth" })
            }}
            className="group relative w-full sm:w-auto px-14 py-6 rounded-xl font-bold text-lg overflow-hidden"
            style={{
              background: "transparent",
              border: "2.5px solid #F8F5F0",
              color: "#F8F5F0",
              boxShadow: "0 0 20px rgba(248, 245, 240, 0.1)"
            }}
            whileHover={{
              scale: 1.12,
              backgroundColor: "rgba(201, 162, 39, 0.15)",
              borderColor: "#C9A227",
              color: "#C9A227",
              boxShadow: "0 0 60px rgba(201, 162, 39, 0.7)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute -inset-1 rounded-xl opacity-0 blur"
              style={{ background: "linear-gradient(135deg, #C9A227, #A67D1F)" }}
              whileHover={{ opacity: 0.4 }}
              transition={{ duration: 0.3 }}
            />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300 transform -skew-x-12 group-hover:translate-x-full"></div>
            <span className="relative flex items-center justify-center gap-3 font-playfair z-10">
              <motion.span
                className="text-2xl"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              >
                🍽️
              </motion.span>
              Reserve Your Table
            </span>
          </motion.button>
        </motion.div>

        {/* Features */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto"
          variants={itemVariants}
        >
          <motion.div
            className="space-y-3 p-6 rounded-xl backdrop-blur-sm"
            style={{ background: "rgba(201, 162, 39, 0.08)", border: "1.5px solid rgba(201, 162, 39, 0.3)" }}
            whileHover={{ y: -8, backgroundColor: "rgba(201, 162, 39, 0.12)" }}
          >
            <p className="text-4xl">🔥</p>
            <p style={{ color: "#C9A227" }} className="font-playfair text-sm font-bold">Authentic</p>
            <p style={{ color: "#A8B0B9" }} className="text-xs">Heritage recipes</p>
          </motion.div>

          <motion.div
            className="space-y-3 p-6 rounded-xl backdrop-blur-sm"
            style={{ background: "rgba(201, 162, 39, 0.08)", border: "1.5px solid rgba(201, 162, 39, 0.3)" }}
            whileHover={{ y: -8, backgroundColor: "rgba(201, 162, 39, 0.12)" }}
          >
            <p className="text-4xl">👨‍🍳</p>
            <p style={{ color: "#C9A227" }} className="font-playfair text-sm font-bold">Expert Chefs</p>
            <p style={{ color: "#A8B0B9" }} className="text-xs">Award-winning</p>
          </motion.div>

          <motion.div
            className="space-y-3 p-6 rounded-xl backdrop-blur-sm"
            style={{ background: "rgba(201, 162, 39, 0.08)", border: "1.5px solid rgba(201, 162, 39, 0.3)" }}
            whileHover={{ y: -8, backgroundColor: "rgba(201, 162, 39, 0.12)" }}
          >
            <p className="text-4xl">⭐</p>
            <p style={{ color: "#C9A227" }} className="font-playfair text-sm font-bold">Premium</p>
            <p style={{ color: "#A8B0B9" }} className="text-xs">Best quality</p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <ChevronDown className="w-8 h-8" style={{ color: "#C9A227", opacity: 0.8 }} />
      </motion.div>
    </section>
  )
}