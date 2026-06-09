import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

const DATABASE_URL = "postgresql://neondb_owner:npg_JU1uWFaTI8ws@ep-hidden-truth-ap6tncve-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DATABASE_URL);

// Create admin user
const hash = await bcrypt.hash("Pakistan.12", 12);
await sql`INSERT INTO users (email, password_hash, name, role) VALUES ('fhadikhan00@gmail.com', ${hash}, 'Fahad Khan', 'admin') ON CONFLICT (email) DO UPDATE SET password_hash = ${hash}, name = 'Fahad Khan', role = 'admin'`;
console.log("✅ Admin user created: fhadikhan00@gmail.com / Pakistan.12");

// Also create demo admin
const demoHash = await bcrypt.hash("admin123", 12);
await sql`INSERT INTO users (email, password_hash, name, role) VALUES ('admin@royalbite.local', ${demoHash}, 'RoyalBite Admin', 'admin') ON CONFLICT (email) DO UPDATE SET password_hash = ${demoHash}, name = 'RoyalBite Admin', role = 'admin'`;
console.log("✅ Demo admin created: admin@royalbite.local / admin123");

process.exit(0);
