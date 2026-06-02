"use client"

import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"

export function ContactSection() {
  const contactInfo = [
    {
      icon: MapPin,
      title: "Address",
      content: "123 Food Street, Karachi, Pakistan",
    },
    {
      icon: Phone,
      title: "Phone",
      content: "+92 300 1234567",
    },
    {
      icon: Mail,
      title: "Email",
      content: "info@royalbite.com",
    },
    {
      icon: Clock,
      title: "Hours",
      content: "11 AM - 11 PM Daily",
    },
  ]

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "linear-gradient(to bottom, rgba(13, 17, 23, 0.95), #0D1117)" }}>
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
            Get In Touch
          </h2>
          <p style={{ color: "#A8B0B9" }} className="text-lg">
            We'd love to hear from you. Reach out to us anytime.
          </p>
        </motion.div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info, index) => {
            const Icon = info.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className="p-6 backdrop-blur-sm text-center"
                  style={{
                    background: "rgba(22, 27, 34, 0.5)",
                    border: "1px solid rgba(201, 162, 39, 0.2)"
                  }}
                >
                  <motion.div whileHover={{ scale: 1.1 }} className="mb-4 flex justify-center">
                    <Icon className="w-10 h-10" style={{ color: "#C9A227" }} />
                  </motion.div>

                  <h3 className="text-xl font-playfair font-bold mb-2" style={{ color: "#F8F5F0" }}>
                    {info.title}
                  </h3>

                  <p style={{ color: "#A8B0B9" }} className="text-sm">
                    {info.content}
                  </p>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Map Section */}
        <motion.div
          className="relative overflow-hidden rounded-lg"
          style={{
            border: "2px solid rgba(201, 162, 39, 0.3)",
            background: "rgba(22, 27, 34, 0.3)",
            height: "400px"
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.8651142393263!2d67.0011!3d24.8607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDUxJzI0LjMiTiA2N8KwMDAnMDQuMCJF!5e0!3m2!1sen!2s!4v1234567890"
            width="100%"
            height="100%"
            style={{ border: "none" }}
            allowFullScreen
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  )
}