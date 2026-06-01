'use client'

import { useEffect } from "react"
import { toast } from "sonner"

export function AdminActionToasts() {
  useEffect(() => {
    const handleSuccess = (event: CustomEvent) => {
      toast.success(event.detail.message || "Action completed successfully")
    }

    const handleError = (event: CustomEvent) => {
      toast.error(event.detail.message || "An error occurred")
    }

    window.addEventListener("admin:success", handleSuccess as EventListener)
    window.addEventListener("admin:error", handleError as EventListener)

    return () => {
      window.removeEventListener("admin:success", handleSuccess as EventListener)
      window.removeEventListener("admin:error", handleError as EventListener)
    }
  }, [])

  return null
}
