// Database migration script
// Usage: node scripts/migrate.js

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

async function migrate() {
  console.log('🚀 Starting database migration...');

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  // Test connection
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT version()');
    console.log('✅ Connected to PostgreSQL', res.rows[0].version.split(',')[0]);
    client.release();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }

  // Read schema SQL
  const schemaPath = path.join(__dirname, '..', 'lib', 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  console.log('📄 Read schema.sql');

  // Split SQL into individual statements using regex that handles $$ blocks
  // This properly splits by semicolons outside of dollar-quoted strings
  const statements = [];
  let currentStatement = '';
  let inDollarString = false;
  let dollarTag = '';

  for (const line of schema.split('\n')) {
    // Skip comment-only lines
    const trimmed = line.trim();
    if (trimmed.startsWith('--') && !currentStatement) continue;

    // Check for dollar-quoted string start/end
    if (!inDollarString) {
      const dollarMatch = line.match(/\$([a-z_]*)\$/);
      if (dollarMatch) {
        inDollarString = true;
        dollarTag = dollarMatch[1];
      }
    } else {
      if (line.includes('$' + dollarTag + '$')) {
        inDollarString = false;
        dollarTag = '';
      }
    }

    currentStatement += line + '\n';

    // Only split on semicolons when NOT inside a dollar-quoted string
    if (!inDollarString && trimmed.endsWith(';')) {
      const clean = currentStatement.trim();
      if (clean.length > 1) {
        statements.push(clean);
      }
      currentStatement = '';
    }
  }

  // Add any remaining
  if (currentStatement.trim().length > 1) {
    statements.push(currentStatement.trim());
  }

  console.log(`📦 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.split('\n')[0].trim().slice(0, 70);

    try {
      await pool.query(stmt);
      successCount++;
      console.log(`  ✅ ${preview}...`);
    } catch (err) {
      const msg = err.message || '';
      // Ignore "already exists" errors
      if (msg.includes('already exists') || msg.includes('duplicate key') || msg.includes('ON CONFLICT DO NOTHING')) {
        successCount++;
        continue;
      }
      errorCount++;
      console.log(`  ⚠️  ${preview}: ${msg.slice(0, 80)}`);
    }
  }

  await pool.end();

  console.log(`\n═══════════════════════════════════════`);
  if (errorCount === 0) {
    console.log(`✅ All ${successCount} statements executed successfully!`);
  } else {
    console.log(`⚠️  Done: ${successCount} succeeded, ${errorCount} with warnings`);
  }
  console.log(`═══════════════════════════════════════`);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
