import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-2xl">
        <ShieldAlert className="mx-auto size-12 text-destructive" />
        <h1 className="mt-4 text-2xl font-semibold">Admin access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This area is only available to authorized RoyalBite administrators.
        </p>
        <Link href="/login" className={cn(buttonVariants(), "mt-6")}>Back to login</Link>
      </div>
    </main>
  )
}
