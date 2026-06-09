import { compare } from "bcryptjs"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { AdminSessionUser, AdminUser } from "@/types/domain"

const now = new Date().toISOString()

// Password: admin123
// Generated with bcryptjs hashSync cost=12
const demoAdminPasswordHash = "$2b$12$CPPosZB6p7jokx6Bw2OJy.30prMgcUQS/1qbondIhybO8u5RJwgK."

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
  // Try database first
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })
    if (user) {
      return {
        id: user.id,
        name: user.name || null,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
      }
    }
  } catch {
    // Fall back to demo users
  }
  return demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
}

export async function verifyAdminCredentials(email: string, password: string) {
  const user = await findAdminUserByEmail(email)
  if (!user) return null

  const valid = await compare(password, user.passwordHash).catch(() => false)
  if (!valid) return null

  return { id: user.id, email: user.email, name: user.name ?? null, role: user.role }
}

export function isAdminUser(user: unknown): user is AdminSessionUser {
  if (!user || typeof user !== "object") return false
  const u = user as Record<string, unknown>
  return u.role === "admin"
}
