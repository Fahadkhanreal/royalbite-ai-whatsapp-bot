"use client"

import { useState, useEffect } from "react"
import { Plus, X, Upload } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { EmptyState } from "@/components/common/feedback-states"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  availability: string
  image_url?: string
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    name: "", description: "", price: "", category: "",
    isAvailable: true, isFeatured: false, isPopular: false, image_url: "",
  })

  useEffect(() => {
    fetch(`/api/menu`)
      .then(r => r.json())
      .then(json => {
        const data = json.data?.dishes || json.dishes || json || []
        setItems(data.map((d: any) => ({
          id: d.id, name: d.name, description: d.description || "",
          price: parseFloat(d.price || 0), category: d.category || "General",
          availability: d.is_available !== false ? "available" : "unavailable",
          image_url: d.image_url || "",
        })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function openAdd() {
    setEditId(null)
    setForm({ name: "", description: "", price: "", category: "", isAvailable: true, isFeatured: false, isPopular: false, image_url: "" })
    setShowModal(true)
  }

  function openEdit(item: MenuItem) {
    setEditId(item.id)
    setForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      isAvailable: item.availability === "available",
      isFeatured: false,
      isPopular: false,
      image_url: item.image_url || "",
    })
    setShowModal(true)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append("image", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const json = await res.json()
      if (json.imageUrl) setForm(p => ({ ...p, image_url: json.imageUrl }))
    } catch {}
    setUploading(false)
  }

  async function handleSave() {
    if (!form.name || !form.price) return

    if (editId) {
      const res = await fetch(`/api/menu/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, description: form.description,
          price: parseFloat(form.price), category: form.category || "General",
          isAvailable: form.isAvailable, isFeatured: form.isFeatured, isPopular: form.isPopular,
          imageUrl: form.image_url || undefined,
        }),
      })
      if (res.ok) {
        setItems(prev => prev.map(i => i.id === editId ? {
          ...i,
          name: form.name, description: form.description,
          price: parseFloat(form.price), category: form.category || "General",
          availability: form.isAvailable ? "available" : "unavailable",
          image_url: form.image_url,
        } : i))
      }
    } else {
      const res = await fetch(`/api/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, description: form.description,
          price: parseFloat(form.price), category: form.category || "General",
          isAvailable: form.isAvailable, isFeatured: form.isFeatured, isPopular: form.isPopular,
          imageUrl: form.image_url || undefined,
        }),
      })
      if (res.ok) {
        const json = await res.json()
        const dish = json.data?.dish || json.dish || json
        if (dish && dish.id) {
          setItems(prev => [...prev, {
            id: dish.id, name: form.name, description: form.description,
            price: parseFloat(form.price), category: form.category || "General",
            availability: form.isAvailable ? "available" : "unavailable",
            image_url: form.image_url,
          }])
        }
      }
    }
    setShowModal(false)
    setEditId(null)
    setForm({ name: "", description: "", price: "", category: "", isAvailable: true, isFeatured: false, isPopular: false, image_url: "" })
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this dish?")) return
    try {
      await fetch(`/api/menu/${id}`, { method: "DELETE" })
      setItems(prev => prev.filter(i => i.id !== id))
    } catch {}
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader title="Menu Management" description="Add, edit, or remove dishes from your restaurant menu." />
        <button onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-playfair font-bold transition-all duration-300 hover:shadow-[0_0_40px_rgba(201,162,39,0.6)] hover:scale-[1.04] whitespace-nowrap"
          style={{ background: "linear-gradient(135deg, #C9A227, #A67D1F)", color: "#0A0A0A", boxShadow: "0 0 20px rgba(201,162,39,0.3)" }}>
          <Plus className="size-4" /> Add Dish
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-lg rounded-2xl p-5 sm:p-6 backdrop-blur-md max-h-[90vh] overflow-y-auto" style={{ background: "rgba(20,15,12,0.95)", border: "1px solid rgba(201,162,39,0.2)" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-playfair font-bold" style={{ color: "#F8F5F0" }}>{editId ? "Edit Dish" : "Add New Dish"}</h3>
              <button onClick={() => { setShowModal(false); setEditId(null) }} style={{ color: "#A8B0B9" }} className="hover:text-[#C9A227] transition-colors"><X className="size-5" /></button>
            </div>
            <div className="space-y-4">
              <input placeholder="Dish Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all" style={{ background: "rgba(10,10,10,0.6)", border: "1px solid rgba(201,162,39,0.2)", color: "#F8F5F0" }} />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all" style={{ background: "rgba(10,10,10,0.6)", border: "1px solid rgba(201,162,39,0.2)", color: "#F8F5F0" }} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input placeholder="Price (Rs.)" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all" style={{ background: "rgba(10,10,10,0.6)", border: "1px solid rgba(201,162,39,0.2)", color: "#F8F5F0" }} />
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "rgba(10,10,10,0.6)", border: "1px solid rgba(201,162,39,0.2)", color: form.category ? "#F8F5F0" : "#6B6560" }}>
                  <option value="" disabled style={{ color: "#6B6560", background: "#1A1110" }}>Select Category</option>
                  <option value="Starters" style={{ background: "#1A1110" }}>🥘 Starters</option>
                  <option value="Main Course" style={{ background: "#1A1110" }}>🍛 Main Course</option>
                  <option value="BBQ" style={{ background: "#1A1110" }}>🔥 BBQ</option>
                  <option value="Desserts" style={{ background: "#1A1110" }}>🍰 Desserts</option>
                  <option value="Beverages" style={{ background: "#1A1110" }}>🥤 Beverages</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5" style={{ color: "#F8F5F0" }}>Dish Image</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm cursor-pointer transition-all hover:bg-[rgba(201,162,39,0.15)]"
                    style={{ background: "rgba(201,162,39,0.08)", color: "#C9A227", border: "1px solid rgba(201,162,39,0.2)" }}>
                    <Upload className="size-4" />
                    {uploading ? "Uploading..." : "Choose File"}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {form.image_url && <span className="text-xs" style={{ color: "#22C55E" }}>✅ Image selected</span>}
                </div>
                {form.image_url && (
                  <img src={form.image_url} alt="Preview" className="mt-2 h-20 rounded-lg object-cover" style={{ border: "1px solid rgba(201,162,39,0.2)" }} />
                )}
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.isAvailable} onChange={e => setForm(p => ({ ...p, isAvailable: e.target.checked }))} id="avail" />
                <label htmlFor="avail" className="text-sm" style={{ color: "#A8B0B9" }}>Available</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} id="featured" />
                <label htmlFor="featured" className="text-sm" style={{ color: "#C9A227" }}>⭐ Show in Featured Dishes</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.isPopular} onChange={e => setForm(p => ({ ...p, isPopular: e.target.checked }))} id="popular" />
                <label htmlFor="popular" className="text-sm" style={{ color: "#22C55E" }}>👑 Mark as Popular in Category</label>
              </div>
              <button onClick={handleSave} className="w-full py-3 rounded-xl font-playfair font-bold transition-all hover:shadow-[0_0_40px_rgba(201,162,39,0.6)]"
                style={{ background: "linear-gradient(135deg, #C9A227, #A67D1F)", color: "#0A0A0A", boxShadow: "0 0 20px rgba(201,162,39,0.3)" }}>
                {editId ? "Save Changes" : "Add to Menu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20"><p style={{ color: "#A8B0B9" }}>Loading menu...</p></div>
      ) : items.length === 0 ? (
        <EmptyState title="No menu items yet" description="Start by adding your first dish to the menu." />
      ) : (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1"
              style={{ background: "rgba(20,15,12,0.6)", border: "1px solid rgba(201,162,39,0.12)", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "linear-gradient(90deg, transparent, #C9A227, transparent)" }} />
              {item.image_url && (
                <div className="relative w-full h-36 overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 60%, rgba(20,15,12,0.9) 100%)" }} />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-playfair font-bold" style={{ color: "#F8F5F0" }}>{item.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: "#C9A227" }}>{item.category}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      background: item.availability === "available" ? "rgba(34,197,94,0.15)" : "rgba(255,159,28,0.15)",
                      color: item.availability === "available" ? "#22C55E" : "#FF9F1C",
                      border: `1px solid ${item.availability === "available" ? "rgba(34,197,94,0.3)" : "rgba(255,159,28,0.3)"}`
                    }}>
                    {item.availability}
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: "#A8B0B9" }}>{item.description}</p>
                <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(201,162,39,0.1)" }}>
                  <span className="text-xl font-bold" style={{ color: "#C9A227" }}>Rs. {item.price}</span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(item)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-[rgba(201,162,39,0.2)]"
                      style={{ background: "rgba(201,162,39,0.1)", color: "#C9A227", border: "1px solid rgba(201,162,39,0.2)" }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-[rgba(239,68,68,0.2)]"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
