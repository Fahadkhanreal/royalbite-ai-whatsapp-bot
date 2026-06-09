"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { loginSchema } from "@/lib/validations/admin"

type LoginState = {
  error?: string
}

async function loginAction(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your login details." }
  }

  const result = await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirect: false,
  })

  if (result?.error) {
    return { error: "Invalid admin credentials. Please try again." }
  }

  return {}
}

function LoginButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 rounded-xl font-playfair font-bold text-base transition-all duration-300"
      style={{
        background: "linear-gradient(135deg, #C9A227, #A67D1F)",
        color: "#0A0A0A",
        boxShadow: "0 0 20px rgba(201, 162, 39, 0.3)",
        opacity: pending ? 0.7 : 1,
      }}
      onMouseEnter={(e) => { if (!pending) { e.currentTarget.style.boxShadow = "0 0 40px rgba(201, 162, 39, 0.6)"; e.currentTarget.style.transform = "scale(1.02)" } }}
      onMouseLeave={(e) => { if (!pending) { e.currentTarget.style.boxShadow = "0 0 20px rgba(201, 162, 39, 0.3)"; e.currentTarget.style.transform = "scale(1)" } }}
    >
      {pending ? "Signing in..." : "Sign in to Dashboard"}
    </button>
  )
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin/dashboard"
  const [state, formAction] = useActionState(async (previousState: LoginState, formData: FormData) => {
    const nextState = await loginAction(previousState, formData)

    if (!nextState.error) {
      toast.success("Welcome back to RoyalBite AI")
      router.push(callbackUrl)
      router.refresh()
    }

    return nextState
  }, {})

  return (
    <div className="w-full max-w-md rounded-2xl p-8 backdrop-blur-md" style={{
      background: "rgba(20, 15, 12, 0.7)",
      border: "1px solid rgba(201, 162, 39, 0.15)",
    }}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center text-2xl font-bold" style={{
          background: "linear-gradient(135deg, #C9A227, #A67D1F)",
          boxShadow: "0 0 30px rgba(201, 162, 39, 0.3)",
        }}>
          <span style={{ color: "#0A0A0A" }}>R</span>
        </div>
        <h2 className="text-2xl font-playfair font-bold" style={{ color: "#F8F5F0" }}>Admin Login</h2>
        <p className="text-sm mt-1" style={{ color: "#A8B0B9" }}>RoyalBite restaurant operators</p>
      </div>

      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: "#F8F5F0" }}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="admin@royalbite.local"
            required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-300 focus:ring-2"
            style={{
              background: "rgba(10, 10, 10, 0.6)",
              border: "1px solid rgba(201, 162, 39, 0.2)",
              color: "#F8F5F0",
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = "#C9A227"}
            onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201, 162, 39, 0.2)"}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: "#F8F5F0" }}>Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-300 focus:ring-2"
            style={{
              background: "rgba(10, 10, 10, 0.6)",
              border: "1px solid rgba(201, 162, 39, 0.2)",
              color: "#F8F5F0",
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = "#C9A227"}
            onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201, 162, 39, 0.2)"}
          />
        </div>
        {state.error ? (
          <p className="rounded-xl px-4 py-3 text-sm text-center" style={{
            background: "rgba(220, 38, 38, 0.1)",
            border: "1px solid rgba(220, 38, 38, 0.2)",
            color: "#EF4444"
          }}>
            {state.error}
          </p>
        ) : null}
        <LoginButton />
      </form>
    </div>
  )
}
