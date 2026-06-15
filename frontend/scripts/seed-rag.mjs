import { neon } from "@neondatabase/serverless";

const DATABASE_URL = "postgresql://neondb_owner:npg_JU1uWFaTI8ws@ep-hidden-truth-ap6tncve-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DATABASE_URL);

// Simple hash embedding generator (768-dim deterministic)
function hashEmbedding(text, dims = 768) {
  const vec = new Array(dims).fill(0);
  const norm = text.toLowerCase().trim();
  const nGrams = [2, 3, 4];
  function hash(s) { let h = 5381; for (let i = 0; i < s.length; i++) { h = ((h << 5) + h) + s.charCodeAt(i); h = h & h; } return Math.abs(h); }
  for (const n of nGrams) {
    for (let i = 0; i <= norm.length - n; i++) {
      const gram = norm.slice(i, i + n);
      const h = hash(gram);
      const idx = h % dims;
      vec[idx] += (1 + i / norm.length) * (h % 3 === 0 ? 1 : -1);
    }
  }
  const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  return mag > 0 ? vec.map(v => v / mag) : vec;
}

// Menu data chunks
const menuChunks = [
  { content: "Sindhi Biryani: Traditional Sindhi biryani with fragrant basmati rice, tender chicken, and aromatic spices. Price: Rs. 250", type: "menu" },
  { content: "Chicken Biryani: Classic chicken biryani with yogurt marinated chicken. Price: Rs. 220", type: "menu" },
  { content: "Beef Biryani: Rich beef biryani with slow-cooked meat and layered rice. Price: Rs. 280", type: "menu" },
  { content: "Chicken Karahi: Fresh tomato-based chicken karahi with ginger and green chilies. Price: Rs. 320", type: "menu" },
  { content: "Karachi Nihari: Slow-cooked lamb nihari with rich gravy and traditional spices. Price: Rs. 280", type: "menu" },
  { content: "Seekh Kebab: Spiced minced meat kebabs grilled to perfection. Price: Rs. 180", type: "menu" },
  { content: "Paratha: Buttery, flaky paratha bread. Price: Rs. 50", type: "menu" },
  { content: "Naan: Soft tandoor-baked naan bread. Price: Rs. 40", type: "menu" },
  { content: "Gulab Jamun: Deep-fried milk dumplings in rose syrup. Price: Rs. 100", type: "menu" },
  { content: "Kheer: Traditional rice pudding with cardamom and nuts. Price: Rs. 80", type: "menu" },
  { content: "Mango Lassi: Creamy yogurt drink with fresh mango pulp. Price: Rs. 120", type: "menu" },
  { content: "We offer a variety of vegetarian dishes including Vegetable Biryani, Dal Tadka, and Palak Paneer.", type: "faq" },
  { content: "RoyalBite accepts cash on delivery, bank transfer, and JazzCash/EasyPaisa.", type: "faq" },
  { content: "Restaurant timings: 11:00 AM to 10:00 PM weekdays, 11:00 AM to 11:00 PM Friday and Saturday.", type: "faq" },
  { content: "Home delivery available via WhatsApp ordering. Delivery takes 30-45 minutes. Minimum order Rs. 300.", type: "faq" },
];

// Insert all chunks
for (const chunk of menuChunks) {
  const embedding = hashEmbedding(chunk.content);
  const metadata = { type: chunk.type, category: chunk.type === "menu" ? "complete-menu" : "general-faq" };
  const source = chunk.type; // Use 'menu' for menu items, 'faq' for FAQs
  await sql`INSERT INTO documents (content, embedding, metadata, source) VALUES (${chunk.content}, ${JSON.stringify(embedding)}::vector, ${JSON.stringify(metadata)}, ${source})`;
  console.log(`✓ Inserted: ${chunk.content.substring(0, 50)}...`);
}

console.log(`\n✅ RAG seeded with ${menuChunks.length} document chunks!`);
process.exit(0);
