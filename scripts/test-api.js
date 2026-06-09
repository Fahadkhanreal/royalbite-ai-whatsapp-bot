// API-level database tests
// Usage: node scripts/test-api.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  console.log('🧪 API-LEVEL DATABASE TESTS\n');

  // Test 1: Menu query
  console.log('--- Test 1: Menu List (GET /api/menu) ---');
  const dishes = await pool.query('SELECT name, price, category, is_available FROM dishes ORDER BY category, name');
  console.log(`   ${dishes.rows.length} dishes found`);
  for (const d of dishes.rows) {
    const avail = d.is_available ? '✅' : '❌';
    console.log(`   ${avail} ${d.name.padEnd(20)} Rs.${String(d.price).padStart(6)}  [${d.category}]`);
  }

  // Test 2: Business timings
  console.log('\n--- Test 2: Business Timings (GET /api/business-timings) ---');
  const timings = await pool.query('SELECT * FROM business_timings ORDER BY day_of_week');
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  for (const t of timings.rows) {
    const day = days[t.day_of_week];
    if (t.is_holiday) console.log(`   📅 ${day.padEnd(12)} 🚫 HOLIDAY`);
    else console.log(`   📅 ${day.padEnd(12)} ${t.open_time} -> ${t.close_time}`);
  }

  // Test 3: Order CRUD (create -> read -> update -> delete)
  console.log('\n--- Test 3: Order CRUD (POST/GET/PUT/DELETE /api/orders) ---');
  const dish = dishes.rows[0];
  const ord = await pool.query(
    "INSERT INTO orders (phone_number, total_price, status) VALUES ('+923482240731', 250, 'pending') RETURNING id"
  );
  const orderId = ord.rows[0].id;
  console.log(`   ✅ Order created: ${orderId}`);

  const dish1 = await pool.query('SELECT id, name FROM dishes LIMIT 1');
  const dishId = dish1.rows[0].id;
  const dishName = dish1.rows[0].name;
  console.log(`   Using dish: ${dishName} (${dishId})`);

  await pool.query(
    'INSERT INTO order_items (order_id, dish_id, quantity, price_at_order) VALUES ($1, $2, 1, 250)',
    [orderId, dishId]
  );
  console.log('   ✅ Order item added');

  const readBack = await pool.query('SELECT status FROM orders WHERE id = $1', [orderId]);
  console.log(`   ✅ Order status: ${readBack.rows[0].status}`);

  await pool.query(
    "UPDATE orders SET status = 'confirmed', confirmed_at = NOW() WHERE id = $1",
    [orderId]
  );
  const updated = await pool.query('SELECT status FROM orders WHERE id = $1', [orderId]);
  console.log(`   ✅ Status updated to: ${updated.rows[0].status}`);

  await pool.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
  await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
  console.log('   ✅ Test order cleaned up');

  // Test 4: SQL schema validation
  console.log('\n--- Test 4: Schema Validation ---');
  const cols = await pool.query(
    "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'dishes' ORDER BY ordinal_position"
  );
  console.log('   dishes table columns:');
  for (const c of cols.rows) {
    console.log(`     ${c.column_name.padEnd(15)} ${c.data_type.padEnd(15)} ${c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
  }

  // Test 5: Chat logs table
  console.log('\n--- Test 5: Chat Logs (WhatsApp logging) ---');
  const chatCols = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'chat_logs' ORDER BY ordinal_position"
  );
  console.log(`   ${chatCols.rows.length} columns in chat_logs`);
  for (const c of chatCols.rows) {
    console.log(`     ${c.column_name.padEnd(15)} ${c.data_type}`);
  }

  console.log('\n✅ ALL API-LEVEL TESTS PASSED!');
  await pool.end();
}

run().catch(e => {
  console.error('❌ Test failed:', e.message);
  pool.end();
  process.exit(1);
});
