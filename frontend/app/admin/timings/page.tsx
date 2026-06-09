"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { listBusinessTimings as getBusinessTimings } from "@/lib/repositories/admin-data"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const DAYS_MAP = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

interface TimingData {
  id: string
  dayOfWeek: string | number
  isOpen: boolean
  opensAt: string
  closesAt: string
  notes?: string
}

export default function TimingsPage() {
  const [timings, setTimings] = useState<TimingData[]>([])
  const [editDay, setEditDay] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ opensAt: "11:00", closesAt: "22:00", isOpen: true })

  useEffect(() => {
    getBusinessTimings().then(data => setTimings(data as TimingData[]))
  }, [])

  function openEdit(day: string) {
    const timing = timings.find((t: any) => t.dayOfWeek === day || t.dayOfWeek === DAYS.indexOf(day))
    setEditForm({
      opensAt: timing?.opensAt?.slice(0, 5) || "11:00",
      closesAt: timing?.closesAt?.slice(0, 5) || "22:00",
      isOpen: timing?.isOpen ?? true,
    })
    setEditDay(day)
  }

  function saveEdit() {
    setTimings(prev => prev.map(t => {
      const dayIdx = DAYS.indexOf(editDay || "")
      if (t.dayOfWeek === DAYS_MAP[dayIdx] || t.dayOfWeek === dayIdx) {
        return { ...t, opensAt: editForm.opensAt + ":00", closesAt: editForm.closesAt + ":00", isOpen: editForm.isOpen }
      }
      return t
    }))
    // Also add if not exists
    if (!timings.find((t: any) => t.dayOfWeek === DAYS.indexOf(editDay || "") || t.dayOfWeek === editDay)) {
      const newTiming: TimingData = {
        id: `timing_${(editDay || "").toLowerCase()}`,
        dayOfWeek: DAYS.indexOf(editDay || ""),
        isOpen: editForm.isOpen,
        opensAt: editForm.opensAt + ":00",
        closesAt: editForm.closesAt + ":00",
      }
      setTimings(prev => [...prev, newTiming])
    }
    setEditDay(null)
  }

  function getTiming(day: string, index: number) {
    return timings.find((t: any) => t.dayOfWeek === DAYS_MAP[index] || t.dayOfWeek === index)
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Business Timings" description="Set your restaurant's opening and closing times for each day." />

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {DAYS.map((day, index) => {
          const timing = getTiming(day, index)
          return (
            <div key={day} className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1"
              style={{ background: "rgba(20,15,12,0.6)", border: "1px solid rgba(201,162,39,0.12)", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "linear-gradient(90deg, transparent, #C9A227, transparent)" }} />
              <div className="p-5">
                <h3 className="text-lg font-playfair font-bold mb-4" style={{ color: "#F8F5F0" }}>{day}</h3>
                {timing?.isOpen ? (
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center p-2.5 rounded-lg" style={{ background: "rgba(10,10,10,0.4)" }}>
                      <span className="text-sm" style={{ color: "#6B6560" }}>Opens</span>
                      <span className="font-medium text-sm" style={{ color: "#F8F5F0" }}>{timing.opensAt?.slice(0, 5)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded-lg" style={{ background: "rgba(10,10,10,0.4)" }}>
                      <span className="text-sm" style={{ color: "#6B6560" }}>Closes</span>
                      <span className="font-medium text-sm" style={{ color: "#F8F5F0" }}>{timing.closesAt?.slice(0, 5)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-3 rounded-lg text-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <span className="text-sm font-medium" style={{ color: "#EF4444" }}>Closed</span>
                  </div>
                )}
                <button onClick={() => openEdit(day)} className="w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[rgba(201,162,39,0.15)]"
                  style={{ background: "rgba(201,162,39,0.08)", color: "#C9A227", border: "1px solid rgba(201,162,39,0.15)" }}>
                  Edit Timing
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Modal */}
      {editDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-md rounded-2xl p-5 sm:p-6 backdrop-blur-md max-h-[90vh] overflow-y-auto" style={{ background: "rgba(20,15,12,0.95)", border: "1px solid rgba(201,162,39,0.2)" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-playfair font-bold" style={{ color: "#F8F5F0" }}>Edit {editDay}</h3>
              <button onClick={() => setEditDay(null)} style={{ color: "#A8B0B9" }} className="hover:text-[#C9A227] transition-colors"><X className="size-5" /></button>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={editForm.isOpen} onChange={e => setEditForm(p => ({ ...p, isOpen: e.target.checked }))}
                  className="w-5 h-5 rounded" style={{ accentColor: "#C9A227" }} />
                <span className="text-sm font-medium" style={{ color: "#F8F5F0" }}>Open on {editDay}</span>
              </label>
              {editForm.isOpen && (
                <>
                  <div>
                    <label className="text-sm font-medium block mb-1.5" style={{ color: "#F8F5F0" }}>Opens At</label>
                    <input type="time" value={editForm.opensAt} onChange={e => setEditForm(p => ({ ...p, opensAt: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:border-[#C9A227]"
                      style={{ background: "rgba(10,10,10,0.6)", border: "1px solid rgba(201,162,39,0.2)", color: "#F8F5F0" }} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5" style={{ color: "#F8F5F0" }}>Closes At</label>
                    <input type="time" value={editForm.closesAt} onChange={e => setEditForm(p => ({ ...p, closesAt: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:border-[#C9A227]"
                      style={{ background: "rgba(10,10,10,0.6)", border: "1px solid rgba(201,162,39,0.2)", color: "#F8F5F0" }} />
                  </div>
                </>
              )}
              <button onClick={saveEdit} className="w-full py-3 rounded-xl font-playfair font-bold transition-all hover:shadow-[0_0_40px_rgba(201,162,39,0.6)]"
                style={{ background: "linear-gradient(135deg, #C9A227, #A67D1F)", color: "#0A0A0A", boxShadow: "0 0 20px rgba(201,162,39,0.3)" }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
