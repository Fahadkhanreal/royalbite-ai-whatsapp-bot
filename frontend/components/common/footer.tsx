"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Send, Heart, MessageCircle } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Menu", href: "/menu" },
    { label: "Gallery", href: "#gallery" },
    { label: "Contact", href: "#contact" },
  ]

  const socialLinks = [
    {
      icon: Send,
      href: "https://facebook.com/royalbite",
      label: "Facebook",
    },
    {
      icon: Heart,
      href: "https://instagram.com/royalbite",
      label: "Instagram",
    },
    {
      icon: MessageCircle,
      href: "https://wa.me/923001234567",
      label: "WhatsApp",
    },
  ]

  return (
    <footer className="bg-royal-dark border-t border-royal-red/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-royal-red to-royal-orange rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-playfair font-bold text-royal-light">
                RoyalBite
              </span>
            </div>
            <p className="text-royal-light/70 text-sm">
              Premium Pakistani & Continental cuisine delivered with passion and excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-royal-light mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-royal-light/70 hover:text-royal-orange transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours & Social */}
          <div>
            <h3 className="text-lg font-semibold text-royal-light mb-4">
              Hours & Follow
            </h3>
            <p className="text-royal-light/70 text-sm mb-4">
              <span className="font-semibold">Open Daily:</span> 11 AM - 11 PM
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-royal-red/20 hover:bg-royal-red/40 rounded-lg flex items-center justify-center text-royal-orange hover:text-royal-light transition-all"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="border-t border-royal-red/20 pt-8">
          <p className="text-center text-royal-light/60 text-sm">
            © {currentYear} RoyalBite. All rights reserved. | Crafted with ❤️ for food lovers
          </p>
        </div>
      </div>
    </footer>
  )
}
