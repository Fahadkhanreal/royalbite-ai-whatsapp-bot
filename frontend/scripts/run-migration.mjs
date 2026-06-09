import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const databaseUrl = 'postgresql://neondb_owner:npg_JU1uWFaTI8ws@ep-hidden-truth-ap6tncve-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(databaseUrl);

// Check existing tables first
const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
console.log('Existing tables:', result.map(t => t.table_name).join(', ') || '(none)');

// Read migration
const migrationSql = fs.readFileSync('lib/db/migrations/0000_unknown_next_avengers.sql', 'utf-8');
const statements = migrationSql.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);

for (const stmt of statements) {
  try {
    await sql(stmt);
    console.log('✓', stmt.substring(0, 50) + '...');
  } catch (err) {
    console.log('→', stmt.substring(0, 50) + '... (already done)');
  }
}

// Verify final state
const finalTables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
console.log('\n✅ Final tables:', finalTables.map(t => t.table_name).join(', '));
process.exit(0);
