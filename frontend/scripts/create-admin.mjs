import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const hash = await bcrypt.hash("Pakistan.12", 12);
await sql`INSERT INTO users (email, password_hash, name, role) VALUES ('fhadikhan00@gmail.com', ${hash}, 'Fahad Khan', 'admin') ON CONFLICT (email) DO UPDATE SET password_hash = ${hash}, name = 'Fahad Khan', role = 'admin'`;
console.log("✅ Admin user created!");
process.exit(0);
