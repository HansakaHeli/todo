import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("Missing DATABASE_URL");

// For Supabase: keep SSL on in prod. In local dev it depends on your setup.
const sql = postgres(databaseUrl, {
  ssl: process.env.NODE_ENV === "production" ? "require" : undefined,
});

export const db = drizzle(sql, { schema });


