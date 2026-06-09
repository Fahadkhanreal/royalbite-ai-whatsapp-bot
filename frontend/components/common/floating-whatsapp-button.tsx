"use client"

import { motion } from "framer-motion"
import { MessageCircle } from "lucide-react"
import { WHATSAPP_NUMBER } from "@/lib/constants"

export function FloatingWhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`

  return (
    <div className="fixed bottom-8 right-8 z-40 group">
      {/* Tooltip */}
      <motion.div
        className="absolute right-16 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg backdrop-blur-md whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0"
        style={{
          background: "rgba(201, 162, 39, 0.12)",
          border: "1px solid rgba(201, 162, 39, 0.3)",
          color: "#F8F5F0",
        }}
      >
        <span className="text-sm font-playfair font-semibold whitespace-nowrap">
          Order on WhatsApp 🍽️
        </span>
        <div
          className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
          style={{
            background: "rgba(201, 162, 39, 0.12)",
            borderRight: "1px solid rgba(201, 162, 39, 0.3)",
            borderTop: "1px solid rgba(201, 162, 39, 0.3)"
          }}
        />
      </motion.div>

      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: "linear-gradient(135deg, #C9A227, #A67D1F)",
          boxShadow: "0 4px 20px rgba(201, 162, 39, 0.4), 0 0 60px rgba(201, 162, 39, 0.15)",
        }}
        whileHover={{
          scale: 1.12,
          boxShadow: "0 4px 30px rgba(201, 162, 39, 0.6), 0 0 80px rgba(201, 162, 39, 0.25)",
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        aria-label="Order on WhatsApp"
      >
        <MessageCircle className="w-7 h-7" style={{ color: "#0A0A0A" }} />
      </motion.a>
    </div>
  )
}
