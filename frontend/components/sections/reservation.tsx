"use client"

import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
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
    alert("Thank you for your reservation! We'll confirm shortly.")
    form.reset()
  }

  return (
    <section
      id="reservations"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-royal-dark"
    >
      <div className="max-w-2xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-royal-light mb-4">
            Reserve Your Table
          </h2>
          <p className="text-royal-orange text-lg">
            Book a table for an unforgettable dining experience
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          className="bg-slate-800/50 border border-royal-red/20 rounded-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-royal-light">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your name"
                        className="bg-slate-900/50 border-royal-red/20 text-royal-light placeholder:text-royal-light/50"
                        {...field}
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
                    <FormLabel className="text-royal-light">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your phone number"
                        className="bg-slate-900/50 border-royal-red/20 text-royal-light placeholder:text-royal-light/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date and Time Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-royal-light">Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="bg-slate-900/50 border-royal-red/20 text-royal-light"
                          {...field}
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
                      <FormLabel className="text-royal-light">Time</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-900/50 border-royal-red/20 text-royal-light">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-900 border-royal-red/20">
                          <SelectItem value="11:00">11:00 AM</SelectItem>
                          <SelectItem value="12:00">12:00 PM</SelectItem>
                          <SelectItem value="13:00">1:00 PM</SelectItem>
                          <SelectItem value="18:00">6:00 PM</SelectItem>
                          <SelectItem value="19:00">7:00 PM</SelectItem>
                          <SelectItem value="20:00">8:00 PM</SelectItem>
                          <SelectItem value="21:00">9:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
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
                    <FormLabel className="text-royal-light">
                      Number of Guests
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-slate-900/50 border-royal-red/20 text-royal-light">
                          <SelectValue placeholder="Select guests" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-royal-red/20">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? "Guest" : "Guests"}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-royal-green hover:bg-green-600 text-white py-6 text-lg rounded-full font-semibold"
              >
                Reserve Table
              </Button>
            </form>
          </Form>
        </motion.div>
      </div>
    </section>
  )
}
