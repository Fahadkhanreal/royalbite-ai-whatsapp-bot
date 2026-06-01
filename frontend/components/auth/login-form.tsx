"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={pending}>
      {pending ? "Signing in..." : "Sign in to dashboard"}
    </Button>
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
    <Card className="w-full max-w-md border-white/10 bg-card/80 shadow-2xl shadow-primary/10 backdrop-blur">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl">Admin Login</CardTitle>
        <CardDescription>Secure access for RoyalBite restaurant operators.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" placeholder="admin@royalbite.local" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
          </div>
          {state.error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p> : null}
          <LoginButton />
          <p className="text-center text-xs text-muted-foreground">
            Demo: admin@royalbite.local / RoyalBiteAdmin123!
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
