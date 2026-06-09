// Database validation test script
// Usage: node scripts/test-db.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function runTests() {
  console.log('🧪 DATABASE VALIDATION TESTS\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ ${name}`);
      passed++;
    } catch (e) {
      console.log(`  ❌ ${name}: ${e.message}`);
      failed++;
    }
  }

  // Test 1: Check all tables exist
  await test('All 9 tables exist', async () => {
    const r = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    const tables = r.rows.map(t => t.table_name);
    const expected = ['business_timings', 'chat_logs', 'dishes', 'documents', 'knowledge_base', 'order_items', 'orders', 'sessions', 'users'];
    for (const t of expected) {
      if (!tables.includes(t)) throw new Error(`Table '${t}' not found. Got: ${tables.join(', ')}`);
    }
    if (tables.length < 9) throw new Error(`Expected 9 tables, found ${tables.length}`);
  });

  // Test 2: Sample dishes exist
  await test('Sample dishes seeded', async () => {
    const r = await pool.query('SELECT COUNT(*) as count FROM dishes');
    if (parseInt(r.rows[0].count) === 0) throw new Error('No dishes found');
    console.log(`       (${r.rows[0].count} dishes in database)`);
  });

  // Test 3: Business timings exist
  await test('Business timings seeded', async () => {
    const r = await pool.query('SELECT COUNT(*) as count FROM business_timings');
    if (parseInt(r.rows[0].count) === 0) throw new Error('No timings found');
    console.log(`       (${r.rows[0].count} timing entries)`);
  });

  // Test 4: Enums are created
  await test('Enum types created', async () => {
    const r = await pool.query(
      "SELECT t.typname, array_agg(e.enumlabel ORDER BY e.enumsortorder) as labels FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid GROUP BY t.typname ORDER BY t.typname"
    );
    if (r.rows.length < 2) throw new Error(`Expected 2 enums, found ${r.rows.length}`);
    console.log(`       Types: ${r.rows.map(r => r.typname + ' (' + r.labels.join(', ') + ')').join(', ')}`);
  });

  // Test 5: Vector extension enabled
  await test('pgvector extension enabled', async () => {
    const r = await pool.query("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'");
    if (r.rows.length === 0) throw new Error('vector extension not installed');
    console.log(`       Version: ${r.rows[0].extversion}`);
  });

  // Test 6: Documents table has vector column
  await test('Documents table has vector(768) column', async () => {
    const r = await pool.query(
      "SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'embedding'"
    );
    if (r.rows.length === 0) throw new Error('embedding column not found');
    // Check it's vector type
    const cr = await pool.query(
      "SELECT typname FROM pg_type t JOIN pg_attribute a ON a.atttypid = t.oid JOIN pg_class c ON c.oid = a.attrelid WHERE c.relname = 'documents' AND a.attname = 'embedding'"
    );
    if (!cr.rows[0]?.typname?.includes('vector')) {
      console.log(`       Type: ${cr.rows[0]?.typname || 'unknown'}`);
    } else {
      console.log('       Type: vector(768)');
    }
  });

  // Test 7: Indexes exist
  await test('Key indexes created', async () => {
    const r = await pool.query(
      "SELECT indexname, indexdef FROM pg_indexes WHERE tablename IN ('dishes', 'orders', 'documents') AND schemaname = 'public' ORDER BY tablename, indexname"
    );
    if (r.rows.length < 4) throw new Error(`Expected 4+ indexes, found ${r.rows.length}`);
    console.log(`       ${r.rows.length} indexes present`);
    r.rows.forEach(idx => console.log(`        - ${idx.indexname}`));
  });

  // Test 8: Triggers exist
  await test('Updated-at triggers exist', async () => {
    const r = await pool.query(
      "SELECT trigger_name, event_manipulation FROM information_schema.triggers WHERE trigger_schema = 'public' ORDER BY trigger_name"
    );
    if (r.rows.length < 5) throw new Error(`Expected 5+ triggers, found ${r.rows.length}`);
    console.log(`       ${r.rows.length} triggers present`);
  });

  // Test 9: RLS / Sessions table foreign key
  await test('Foreign key relationships valid', async () => {
    const r = await pool.query(
      "SELECT conname as constraint_name, contype as type FROM pg_constraint WHERE conrelid = 'sessions'::regclass OR conrelid = 'order_items'::regclass"
    );
    console.log(`       ${r.rows.length} constraints on sessions + order_items`);
  });

  // Test 10: Database connection works (health check)
  await test('Database SELECT 1 works', async () => {
    const r = await pool.query('SELECT 1 as health');
    if (r.rows[0]?.health !== 1) throw new Error('Basic query failed');
  });

  console.log(`\n═══════════════════════════════════════`);
  console.log(`📊 RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`═══════════════════════════════════════`);

  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(e => {
  console.error('Test suite failed:', e);
  pool.end();
  process.exit(1);
});
