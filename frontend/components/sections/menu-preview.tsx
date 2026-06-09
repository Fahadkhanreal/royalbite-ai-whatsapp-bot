"use client"

import { WHATSAPP_NUMBER } from "@/lib/constants"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const API = ""

const MENU_CATEGORIES = [
  { id: 1, name: "Starters", icon: "🥘", emojis: "🥟🧆🥗", popular: "Samosa", slug: "Starters", image: "/why-choose/menu-starters.jpg", description: "Light bites to start your meal" },
  { id: 2, name: "Main Course", icon: "🍛", emojis: "🍚🍗🥩", popular: "Chicken Karahi", slug: "Main Course", image: "/why-choose/menu-main-course.jpg", description: "Hearty traditional dishes" },
  { id: 3, name: "BBQ", icon: "🔥", emojis: "🍖🥩🌶️", popular: "Seekh Kebab", slug: "BBQ", image: "/why-choose/menu-bbq.jpg", description: "Char-grilled perfection" },
  { id: 4, name: "Desserts", icon: "🍰", emojis: "🍮🍨🍦", popular: "Gulab Jamun", slug: "Desserts", image: "/why-choose/menu-desserts.jpg", description: "Sweet endings to remember" },
  { id: 5, name: "Beverages", icon: "🥤", emojis: "🧋☕🍵", popular: "Mango Lassi", slug: "Beverages", image: "/why-choose/menu-beverages.jpg", description: "Refreshing drinks" },
]

function TiltCard({ cat, count, index }: { cat: typeof MENU_CATEGORIES[0]; count: number; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }}>
      <Card className="group cursor-pointer relative overflow-hidden transition-all duration-300 hover:-translate-y-1" style={{ background: "rgba(20,15,12,0.6)", border: "1px solid rgba(201,162,39,0.2)", height: "350px" }}>
          <div className="absolute inset-0 opacity-50 group-hover:opacity-65 transition-opacity duration-500">
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              sizes="(max-width: 768px) 100vw, 20vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,10,10,0.1) 0%, rgba(10,10,10,0.4) 40%, rgba(10,10,10,0.7) 70%, rgba(10,10,10,0.9) 100%)" }} />
          <div className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"
            style={{ background: "linear-gradient(90deg, transparent, #C9A227, transparent)" }} />

          <div className="relative z-10 p-4 flex flex-col h-full" style={{ transform: "translateZ(25px)" }}>
            <motion.div whileHover={{ scale: 1.15 }} className="text-4xl mb-1 text-center">{cat.icon}</motion.div>
            <h3 className="text-lg font-playfair font-bold mb-0.5 text-center" style={{ color: "#F8F5F0" }}>{cat.name}</h3>
            <div className="mb-1 text-center">
              <span className="text-sm px-2.5 py-0.5 rounded-full" style={{ background: "rgba(10,10,10,0.5)", color: "#C9A227", border: "1px solid rgba(201,162,39,0.3)" }}>
                {count} Items
              </span>
            </div>
            <p className="text-sm mb-1 flex-1 text-center leading-snug" style={{ color: "#E0D8D0" }}>{cat.description}</p>
            <div className="text-base tracking-wider mb-1 text-center">{cat.emojis}</div>
            <div className="text-sm mb-2 text-center" style={{ color: "#9B9088" }}>Popular: <span style={{ color: "#C9A227" }}>{cat.popular}</span> 👑</div>
            <a href="/menu" className="btn-gold w-full block text-center py-2 rounded text-sm" style={{ transform: "translateZ(15px)" }}>Explore</a>
          </div>
        </Card>
    </motion.div>
  )
}

export function MenuPreview() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const apiBase = ""

  useEffect(() => {
    fetch(`${apiBase}/api/menu`)
      .then(r => r.json())
      .then(json => {
        const dishes = json.data?.dishes || json.dishes || json || []
        const catCounts: Record<string, number> = {}
        for (const cat of MENU_CATEGORIES) {
          const items = dishes.filter((d: any) => d.category === cat.slug)
          catCounts[cat.slug] = items.length
          // Find popular dish marked by admin, else use first available
          const popular = items.find((d: any) => d.is_popular === true)
          cat.popular = popular ? popular.name : (items[0]?.name || cat.popular)
        }
        setCounts(catCounts)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "linear-gradient(to bottom, rgba(10, 10, 10, 0.95), #0A0A0A)" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <h2 className="text-4xl sm:text-5xl font-playfair font-bold mb-4" style={{ color: "#F8F5F0" }}>Our Menu</h2>
          <p style={{ color: "#A8B0B9" }} className="text-lg">Explore our diverse culinary offerings</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {loading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ background: "rgba(20, 15, 12, 0.6)", border: "1px solid rgba(201, 162, 39, 0.2)", height: "350px" }}>
                <Skeleton className="w-full h-full rounded-none" style={{ background: "rgba(40, 30, 25, 0.6)" }} />
              </div>
            ))
          ) : (
            MENU_CATEGORIES.map((cat, index) => (
              <TiltCard key={cat.id} cat={cat} count={counts[cat.slug] ?? 0} index={index} />
            ))
          )}
        </div>

        <motion.div className="text-center mt-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <a href={`https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=Send%20me%20the%20full%20menu`} className="btn-outline-gold text-lg px-10 py-3 inline-block rounded">Get Full Menu</a>
        </motion.div>
      </div>
    </section>
  )
}
