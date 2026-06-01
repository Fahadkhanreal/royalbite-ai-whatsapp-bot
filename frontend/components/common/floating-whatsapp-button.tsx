"use client"

import { motion } from "framer-motion"
import { MessageCircle } from "lucide-react"
import { WHATSAPP_NUMBER } from "@/lib/constants"

export function FloatingWhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}`

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-royal-green rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300 animate-pulse-slow"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      aria-label="Order on WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white" />
    </motion.a>
  )
}
