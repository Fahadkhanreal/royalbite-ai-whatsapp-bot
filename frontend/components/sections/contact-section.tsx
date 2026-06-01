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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section
      id="contact"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-royal-dark to-slate-900"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-royal-light mb-4">
            Get in Touch
          </h2>
          <p className="text-royal-orange text-lg">
            Visit us or contact us for more information
          </p>
        </motion.div>

        {/* Contact Info Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {contactInfo.map((info, index) => {
            const Icon = info.icon
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="bg-slate-800/50 border-royal-red/20 p-6 text-center hover-lift">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-royal-red to-royal-orange rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-royal-light mb-2">
                    {info.title}
                  </h3>
                  <p className="text-royal-light/70">{info.content}</p>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Map Container */}
        <motion.div
          className="rounded-lg overflow-hidden h-96 border border-royal-red/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.2434916050147!2d67.0099!3d24.8607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33e06651c0001%3A0x1234567890!2sKarachi%2C%20Pakistan!5e0!3m2!1sen!2s!4v1234567890"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>
      </div>
    </section>
  )
}
