"use client"

import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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

  const onSubmit = async (data: ReservationFormValues) => {
    console.log("Reservation submitted:", data)
    const message = `Reservation: ${data.fullName}, ${data.date} at ${data.time} for ${data.guests} guests. Phone: ${data.phone}`
    window.location.href = `https://wa.me/923001234567?text=${encodeURIComponent(message)}`
  }

  return (
    <section id="reservations" className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "linear-gradient(to bottom, #0D1117, rgba(13, 17, 23, 0.95))" }}>
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
            background: "rgba(22, 27, 34, 0.5)",
            border: "1px solid rgba(201, 162, 39, 0.2)"
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#F8F5F0" }}>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your full name"
                        {...field}
                        style={{
                          background: "rgba(13, 17, 23, 0.5)",
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
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#F8F5F0" }}>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your phone number"
                        {...field}
                        style={{
                          background: "rgba(13, 17, 23, 0.5)",
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
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#F8F5F0" }}>Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          style={{
                            background: "rgba(13, 17, 23, 0.5)",
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
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#F8F5F0" }}>Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          style={{
                            background: "rgba(13, 17, 23, 0.5)",
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
              <FormField
                control={form.control}
                name="guests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: "#F8F5F0" }}>Number of Guests</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger style={{ background: "rgba(13, 17, 23, 0.5)", borderColor: "rgba(201, 162, 39, 0.3)" }}>
                          <SelectValue placeholder="Select number of guests" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? "Guest" : "Guests"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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