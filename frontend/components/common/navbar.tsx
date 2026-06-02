"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { motion } from "framer-motion"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#menu", label: "Menu" },
    { href: "#gallery", label: "Gallery" },
    { href: "#reservations", label: "Reservations" },
    { href: "#contact", label: "Contact" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md" style={{ backgroundColor: "rgba(13, 17, 23, 0.9)", borderBottom: "1px solid rgba(42, 47, 54, 0.5)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} className="cursor-pointer">
            <Link href="/" className="flex items-center space-x-3">
              <motion.div
                className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg text-black relative overflow-hidden group"
                style={{
                  background: "linear-gradient(135deg, #C9A227, #A67D1F)",
                  boxShadow: "0 0 20px rgba(201, 162, 39, 0.4)"
                }}
                whileHover={{ boxShadow: "0 0 40px rgba(201, 162, 39, 0.8)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-25 transform -skew-x-12 group-hover:translate-x-full transition-all duration-500"></div>
                <span className="relative z-10">R</span>
              </motion.div>

              <motion.span
                className="hidden sm:inline text-2xl font-playfair font-bold"
                style={{ color: "#F8F5F0" }}
                whileHover={{ letterSpacing: "0.1em" }}
              >
                RoyalBite
              </motion.span>
            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium group"
                style={{ color: "#A8B0B9" }}
                whileHover={{ color: "#C9A227" }}
                transition={{ duration: 0.3 }}
              >
                {link.label}
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5"
                  style={{ background: "linear-gradient(to right, #C9A227, #A67D1F)" }}
                  initial={{ width: "0%" }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.a
              href="https://wa.me/923001234567?text=Hi%20RoyalBite%2C%20I%20want%20to%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-8 py-2.5 rounded-full font-semibold text-black overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #C9A227, #A67D1F)",
                boxShadow: "0 0 20px rgba(201, 162, 39, 0.3)"
              }}
              whileHover={{ scale: 1.1, boxShadow: "0 0 40px rgba(201, 162, 39, 0.7)" }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-white transition-opacity duration-300 transform -skew-x-12 group-hover:translate-x-full"></div>

              <motion.div
                className="absolute -inset-0.5 rounded-full opacity-0 blur"
                style={{ background: "linear-gradient(135deg, #C9A227, #A67D1F)" }}
                whileHover={{ opacity: 0.6 }}
                transition={{ duration: 0.3 }}
              />

              <span className="relative flex items-center gap-2 z-10 font-playfair">
                📱 Order Now
              </span>
            </motion.a>
          </div>

          {/* Mobile Menu */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
            style={{ color: "#C9A227" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <motion.div
            className="md:hidden pb-4 space-y-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="block px-4 py-2 rounded transition-colors"
                style={{ color: "#A8B0B9" }}
                whileHover={{
                  x: 8,
                  backgroundColor: "rgba(201, 162, 39, 0.1)",
                  color: "#C9A227"
                }}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </motion.a>
            ))}
            <motion.a
              href="https://wa.me/923001234567?text=Hi%20RoyalBite%2C%20I%20want%20to%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-full mt-4 font-semibold py-2.5 text-center text-black font-playfair"
              style={{
                background: "linear-gradient(135deg, #C9A227, #A67D1F)",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              📱 Order on WhatsApp
            </motion.a>
          </motion.div>
        )}
      </div>
    </nav>
  )
}