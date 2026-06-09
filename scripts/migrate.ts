// Database migration script
// Runs schema.sql directly against Neon PostgreSQL
// Usage: npx tsx scripts/migrate.ts

import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

async function migrate() {
  console.log('🚀 Starting database migration...');
  console.log(`📦 Connecting to Neon database...`);

  const sql = neon(DATABASE_URL);

  // Read schema SQL
  const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  // Split by semicolons and execute each statement
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    try {
      // Skip COMMENT ON statements
      if (statement.toUpperCase().startsWith('COMMENT ON')) continue;

      await sql(statement + ';');
      successCount++;
      const preview = statement.split('\n')[0].trim().slice(0, 80);
      console.log(`  ✅ ${preview}...`);
    } catch (err: any) {
      // Ignore "already exists" errors
      if (err.message?.includes('already exists')) {
        successCount++;
        continue;
      }
      errorCount++;
      console.error(`  ❌ Error: ${err.message.slice(0, 100)}`);
    }
  }

  console.log(`\n✅ Migration complete: ${successCount} succeeded, ${errorCount} failed`);

  if (errorCount > 0) {
    process.exit(1);
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
