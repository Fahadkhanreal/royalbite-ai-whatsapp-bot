import { forbidden, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { isAdminUser } from "@/lib/repositories/admin-users"

export async function requireAdmin() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (!isAdminUser(session.user)) {
    forbidden()
  }

  return session.user
}

export async function getOptionalAdmin() {
  const session = await auth()
  return isAdminUser(session?.user) ? session?.user : null
}
