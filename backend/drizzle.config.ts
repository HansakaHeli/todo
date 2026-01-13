import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

// Note: drizzle-kit needs `dbCredentials.url` in config. We provide a harmless default to allow
// `db:generate` to run even before you've created `backend/.env`.
const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/postgres";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});


