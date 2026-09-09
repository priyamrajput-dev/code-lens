import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});
export const db = drizzle({ client: pool });

export async function connectDB() {
  const q = await pool.query("SELECT 1");
  console.log("Postgres is Connected", q.rows[0]);
}
