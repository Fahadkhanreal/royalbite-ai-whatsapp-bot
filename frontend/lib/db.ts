import { neon } from "@neondatabase/serverless"

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for server-side database access")
  }

  return databaseUrl
}

export function getSql() {
  return neon(getDatabaseUrl())
}

export type SqlClient = ReturnType<typeof getSql>
