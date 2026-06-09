import Link from "next/link"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { Home } from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import { auth } from "@/lib/auth"

export default async function LoginPage() {
  const session = await auth()

  if (session?.user?.role === "admin") {
    redirect("/admin/dashboard")
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12" style={{ backgroundColor: "#0A0A0A" }}>
      {/* Golden glow */}
      <div className="absolute inset-0 -z-10" style={{
        background: "radial-gradient(circle at 50% 50%, rgba(201, 162, 39, 0.06) 0%, transparent 60%)"
      }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] -z-10 opacity-30" style={{
        background: "radial-gradient(ellipse at center, rgba(201, 162, 39, 0.1) 0%, transparent 70%)"
      }} />

      {/* Home link */}
      <Link href="/" className="absolute top-6 left-6 z-10 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-[rgba(201,162,39,0.1)]"
        style={{ color: "#C9A227", border: "1px solid rgba(201,162,39,0.2)" }}>
        <Home className="size-4" />
        Home
      </Link>

      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] -z-10" style={{
        background: "linear-gradient(90deg, transparent, rgba(201, 162, 39, 0.4), transparent)"
      }} />

      <section className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-playfair font-semibold tracking-wide" style={{
            border: "1px solid rgba(201, 162, 39, 0.3)",
            background: "rgba(201, 162, 39, 0.08)",
            color: "#C9A227"
          }}>
            👑 RoyalBite AI Admin
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-playfair" style={{ color: "#F8F5F0" }}>
              Premium restaurant <span style={{ color: "#C9A227" }}>control room.</span>
            </h1>
            <p className="max-w-xl text-lg" style={{ color: "#A8B0B9" }}>
              Manage menu, orders, timings, knowledge, documents, analytics, and bot settings from one secure dashboard.
            </p>
          </div>
          {/* Features */}
          <div className="flex flex-wrap gap-4 pt-4">
            {["🍽️ Menu", "📋 Orders", "📊 Analytics", "🤖 AI Bot"].map((f) => (
              <span key={f} className="text-sm px-3 py-1.5 rounded-full" style={{
                background: "rgba(20, 15, 12, 0.6)",
                border: "1px solid rgba(201, 162, 39, 0.15)",
                color: "#C0B8B0"
              }}>{f}</span>
            ))}
          </div>
        </div>
        <Suspense fallback={
          <div className="h-96 rounded-2xl" style={{
            background: "rgba(20, 15, 12, 0.6)",
            border: "1px solid rgba(201, 162, 39, 0.15)"
          }} />
        }>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  )
}
