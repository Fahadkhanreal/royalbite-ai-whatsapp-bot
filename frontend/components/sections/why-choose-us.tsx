"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"

const FEATURES = [
  {
    emoji: "🥬",
    title: "Fresh Ingredients",
    description: "Sourced daily from trusted farms — farm-to-table freshness in every bite",
    image: "/why-choose/fresh.jpg",
    scrollTo: "#menu",
  },
  {
    emoji: "👨‍🍳",
    title: "Master Chefs",
    description: "Award-winning chefs crafting authentic Pakistani flavours with passion",
    image: "/why-choose/chef.jpg",
    scrollTo: "#about",
  },
  {
    emoji: "⚡",
    title: "Fast Delivery",
    description: "Order via WhatsApp and get your favourites delivered in 30–45 mins",
    image: "/why-choose/delivery.jpg",
    scrollTo: "#contact",
  },
  {
    emoji: "❤️",
    title: "Family Atmosphere",
    description: "Warm, welcoming space where every guest is treated like family",
    image: "/why-choose/family.jpg",
    scrollTo: "#reservations",
  },
]

function TiltCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Card
        className="group cursor-pointer relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
        style={{
          border: "1px solid rgba(201, 162, 39, 0.15)",
          background: "rgba(20, 15, 12, 0.6)",
          cursor: "pointer",
        }}
        onClick={() => {
          const el = document.querySelector(feature.scrollTo)
          el?.scrollIntoView({ behavior: "smooth", block: "start" })
        }}
      >
        {/* Background Image */}
        <div className="absolute inset-0 opacity-70 group-hover:opacity-80 transition-opacity duration-500">
          <Image
            src={feature.image}
            alt={feature.title}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover"
          />
        </div>

        {/* Dark gradient overlay */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, rgba(10,10,10,0.1) 0%, rgba(10,10,10,0.5) 40%, rgba(10,10,10,0.85) 70%, rgba(10,10,10,0.95) 100%)"
        }} />

        {/* Golden accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" style={{
          background: "linear-gradient(90deg, transparent, #C9A227, transparent)"
        }} />

        {/* Content */}
        <div className="relative z-10 p-6">
          <div className="mb-3 text-4xl">
            {feature.emoji}
          </div>

          <h3 className="text-lg font-playfair font-bold mb-2" style={{ color: "#F8F5F0" }}>
            {feature.title}
          </h3>

          <p className="text-sm leading-relaxed font-medium" style={{ color: "#D0C8C0", textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
            {feature.description}
          </p>
        </div>
      </Card>
    </motion.div>
  )
}

export function WhyChooseUs() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24" style={{ background: "linear-gradient(to bottom, rgba(10, 10, 10, 0.95), #0A0A0A)" }}>
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
            Why Choose RoyalBite
          </h2>
          <p style={{ color: "#A8B0B9" }} className="text-lg">
            Experience excellence in every aspect
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, index) => (
            <TiltCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}