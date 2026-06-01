import bcrypt from "bcryptjs"
import type { AdminSessionUser, AdminUser } from "@/types/domain"

const now = new Date("2026-01-01T00:00:00.000Z").toISOString()

const demoAdminPasswordHash = bcrypt.hashSync("RoyalBiteAdmin123!", 10)

const demoUsers: AdminUser[] = [
  {
    id: "admin_royalbite",
    name: "RoyalBite Admin",
    email: "admin@royalbite.local",
    passwordHash: demoAdminPasswordHash,
    role: "admin",
    status: "active",
    createdAt: now,
    updatedAt: now,
  },
]

export async function findAdminUserByEmail(email: string) {
  return demoUsers.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null
}

export async function verifyAdminCredentials(email: string, password: string) {
  const user = await findAdminUserByEmail(email)

  if (!user || user.status !== "active") {
    return null
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash)

  if (!isValidPassword) {
    return null
  }

  return toSessionUser(user)
}

export function toSessionUser(user: AdminUser): AdminSessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

export function isAdminUser(user?: Pick<AdminSessionUser, "role"> | null) {
  return user?.role === "admin"
}
