import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { env } from '@/lib/env';
import * as schema from './schema';

const databaseUrl = env.DATABASE_URL || process.env.DATABASE_URL || '';
if (!databaseUrl) {
  console.warn('DATABASE_URL not set — DB features disabled');
}

// Create Neon HTTP client
const sql = databaseUrl ? neon(databaseUrl) : null;

// Create Drizzle ORM instance with schema
export const db = sql ? drizzle(sql, { schema }) : null;

// Type for database queries (returns the actual Drizzle type or null)
export type Database = ReturnType<typeof drizzle<typeof schema>>;

// Helper function to get database instance with safety check
export function getDb(): typeof db {
  if (!db) {
    throw new Error('Database not initialized. Check DATABASE_URL environment variable.');
  }
  return db;
}
