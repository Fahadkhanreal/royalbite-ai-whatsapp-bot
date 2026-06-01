import { Suspense } from "react"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { auth } from "@/lib/auth"

export default async function LoginPage() {
  const session = await auth()

  if (session?.user?.role === "admin") {
    redirect("/admin/dashboard")
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(225,29,72,0.25),transparent_30rem),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.2),transparent_26rem)]" />
      <section className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6 text-center lg:text-left">
          <div className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            RoyalBite AI Admin
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Premium restaurant control room.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Manage menu, orders, timings, knowledge, documents, analytics, and bot settings from one secure dashboard.
            </p>
          </div>
        </div>
        <Suspense fallback={<div className="h-96 rounded-3xl border border-border bg-card/60" />}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  )
}
