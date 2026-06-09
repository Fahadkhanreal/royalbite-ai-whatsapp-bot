"use client"

import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import * as z from "zod"
import emailjs from "@emailjs/browser"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const reservationSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  guests: z.string().min(1, "Please select number of guests"),
  specialRequests: z.string().optional(),
})

type ReservationFormValues = z.infer<typeof reservationSchema>

function formatTo12Hour(time24: string): string {
  if (!time24) return time24
  const [h, m] = time24.split(":").map(Number)
  if (isNaN(h) || isNaN(m)) return time24
  const period = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`
}

const GUEST_OPTIONS = [
  ...Array.from({ length: 20 }, (_, i) => i + 1),
]

export function Reservation() {
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      date: "",
      time: "",
      guests: "",
      specialRequests: "",
    },
  })

  const [isCustomGuests, setIsCustomGuests] = useState(false)

  const onSubmit = async (data: ReservationFormValues) => {
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          to_name: "RoyalBite Admin",
          from_name: data.fullName,
          phone: data.phone,
          date: data.date,
          time: formatTo12Hour(data.time),
          guests: data.guests,
          message: data.specialRequests || "No special requests",
          to_email: "admin@royalbite.com",
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      )

      toast.success("Reservation confirmed! 🎉 We will call you shortly.", {
        duration: 5000,
      })
      form.reset()
      setIsCustomGuests(false)
    } catch (error) {
      console.error("EmailJS error:", error)
      toast.error("Failed to submit reservation. Please try again or call us.", {
        duration: 5000,
      })
    }
  }

  return (
    <section id="reservations" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24" style={{ background: "linear-gradient(to bottom, #0A0A0A, rgba(13, 17, 23, 0.95))" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-playfair font-bold mb-4" style={{ color: "#F8F5F0" }}>
            Reserve Your Table
          </h2>
          <p style={{ color: "#A8B0B9" }} className="text-lg">
            Book your dining experience with us
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          className="rounded-lg p-8 backdrop-blur-sm"
          style={{
            background: "rgba(20, 15, 12, 0.6)",
            border: "1px solid rgba(201, 162, 39, 0.2)"
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control as any}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#F8F5F0" }}>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your full name"
                        {...field}
                        style={{
                          background: "rgba(10, 10, 10, 0.6)",
                          borderColor: "rgba(201, 162, 39, 0.3)",
                          color: "#F8F5F0"
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control as any}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#F8F5F0" }}>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your phone number"
                        {...field}
                        style={{
                          background: "rgba(10, 10, 10, 0.6)",
                          borderColor: "rgba(201, 162, 39, 0.3)",
                          color: "#F8F5F0"
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Grid - Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#F8F5F0" }}>Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          style={{
                            background: "rgba(10, 10, 10, 0.6)",
                            borderColor: "rgba(201, 162, 39, 0.3)",
                            color: "#F8F5F0"
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#F8F5F0" }}>Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          style={{
                            background: "rgba(10, 10, 10, 0.6)",
                            borderColor: "rgba(201, 162, 39, 0.3)",
                            color: "#F8F5F0"
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Guests */}
              {!isCustomGuests ? (
                <FormField
                  control={form.control as any}
                  name="guests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#F8F5F0" }}>Number of Guests</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger style={{ background: "rgba(10, 10, 10, 0.6)", borderColor: "rgba(201, 162, 39, 0.3)" }}>
                            <SelectValue placeholder="Select number of guests" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GUEST_OPTIONS.map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? "Guest" : "Guests"}
                            </SelectItem>
                          ))}
                          <div className="px-1.5 py-2 border-t" style={{ borderColor: "rgba(201,162,39,0.2)" }}>
                            <button
                              type="button"
                              className="w-full text-sm py-1.5 rounded-md transition-colors"
                              style={{ color: "#C9A227", background: "rgba(201,162,39,0.08)" }}
                              onClick={() => { setIsCustomGuests(true); form.setValue("guests", "") }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(201,162,39,0.15)"}
                              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(201,162,39,0.08)"}
                            >
                              ✏️ Custom number
                            </button>
                          </div>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control as any}
                  name="guests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#F8F5F0" }}>
                        Number of Guests
                        <button
                          type="button"
                          className="ml-2 text-xs underline"
                          style={{ color: "#A8B0B9" }}
                          onClick={() => { setIsCustomGuests(false); form.setValue("guests", "") }}
                        >
                          (back to list)
                        </button>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          placeholder="Enter number of guests"
                          {...field}
                          style={{
                            background: "rgba(10, 10, 10, 0.6)",
                            borderColor: "rgba(201, 162, 39, 0.3)",
                            color: "#F8F5F0"
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Special Requests */}
              <FormField
                control={form.control as any}
                name="specialRequests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#F8F5F0" }}>Special Requests <span style={{ color: "#A8B0B9", fontWeight: 400, fontSize: "0.875rem" }}>(optional)</span></FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Any special requests? Dietary restrictions, occasion, seating preference..."
                        {...field}
                        rows={3}
                        style={{
                          width: "100%",
                          background: "rgba(10, 10, 10, 0.6)",
                          border: "1px solid rgba(201, 162, 39, 0.3)",
                          borderRadius: "0.5rem",
                          color: "#F8F5F0",
                          padding: "0.75rem",
                          fontSize: "0.875rem",
                          resize: "vertical",
                          outline: "none",
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = "#C9A227"}
                        onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201, 162, 39, 0.3)"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button type="submit" className="w-full btn-gold text-lg py-3 rounded">
                  Reserve Now
                </button>
              </motion.div>
            </form>
          </Form>
        </motion.div>
      </div>
    </section>
  )
}