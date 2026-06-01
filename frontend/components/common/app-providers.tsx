"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <TooltipProvider>
      {children}
      <Toaster richColors closeButton position="top-right" />
    </TooltipProvider>
  )
}
