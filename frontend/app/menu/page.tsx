"use client"

import { useState, useEffect } from "react"
import { FloatingWhatsAppButton } from "@/components/common/floating-whatsapp-button"
import { EmptyState } from "@/components/common/feedback-states"
import { WHATSAPP_NUMBER } from "@/lib/constants"

// Metadata handled by root layout template — page-specific SEO below
// export const metadata = { title: "Full Menu" } — client component, so no metadata export

export default function PublicMenuPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/menu`)
      .then(r => r.json())
      .then(json => {
        const data = json.data?.dishes || json.dishes || json || []
        setItems(data.filter((d: any) => d.is_available !== false))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const categories = items.reduce((acc: any, item: any) => {
    const cat = item.category || "General"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#0A0A0A" }}>
      <section className="px-6 py-16" style={{ borderBottom: "1px solid rgba(201,162,39,0.15)" }}>
        <div className="mx-auto max-w-6xl space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: "#C9A227" }}>RoyalBite Menu</p>
          <h1 className="text-4xl font-bold tracking-tight font-playfair" style={{ color: "#F8F5F0" }}>Our Full Menu</h1>
          <p className="text-lg" style={{ color: "#A8B0B9" }}>Browse our complete menu and order via WhatsApp!</p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          {loading ? (
            <div className="text-center py-12"><p style={{ color: "#A8B0B9" }}>Loading menu...</p></div>
          ) : items.length === 0 ? (
            <EmptyState title="Menu is being prepared" description="Please message us on WhatsApp for today's available dishes." />
          ) : (
            <div className="space-y-12">
              {Object.entries(categories).map(([category, categoryItems]: [string, unknown]) => (
                <div key={category} className="space-y-4">
                  <h2 className="text-2xl font-playfair font-bold" style={{ color: "#C9A227" }}>{category}</h2>
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {(categoryItems as any[]).map((item: any) => (
                      <div key={item.id} className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1"
                        style={{ background: "rgba(20,15,12,0.6)", border: "1px solid rgba(201,162,39,0.12)", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
                        <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: "linear-gradient(90deg, transparent, #C9A227, transparent)" }} />

                        <div className="relative w-full h-44 overflow-hidden" style={{ background: "rgba(201,162,39,0.05)" }}>
                            <img
                              src={item.imageUrl || item.image_url || `/dishes/${item.name.toLowerCase().replace(/\s+/g, "-")}.jpg`}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 50%, rgba(20,15,12,0.95) 100%)" }} />
                          </div>

                        <div className="p-5">
                          <h3 className="text-lg font-playfair font-bold mb-2" style={{ color: "#F8F5F0" }}>{item.name}</h3>
                          <p className="text-sm mb-4" style={{ color: "#A8B0B9" }}>{item.description}</p>
                          <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(201,162,39,0.1)" }}>
                            <span className="text-xl font-bold" style={{ color: "#C9A227" }}>Rs. {typeof item.price === "number" ? item.price : parseFloat(item.price || 0).toFixed(0)}</span>
                            <a href={`https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=I%20want%20to%20order%20${item.name}`}
                              target="_blank" rel="noopener noreferrer"
                              className="px-5 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-[0_0_30px_rgba(201,162,39,0.5)]"
                              style={{ background: "linear-gradient(135deg, #C9A227, #A67D1F)", color: "#0A0A0A" }}>
                              Order
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <FloatingWhatsAppButton />
    </main>
  )
}
