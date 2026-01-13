import cors from "cors";
import "dotenv/config";
import express from "express";

import todosRouter from "./routes/todos";
import authRouter from "./routes/auth";
import { requireAuth } from "./middleware/auth";

const app = express();

const port = Number(process.env.PORT ?? 4000);
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";

// Dev ergonomics: allow running locally without configuring JWT_SECRET,
// but never allow this in production.
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing JWT_SECRET");
  }
  // eslint-disable-next-line no-console
  console.warn('[backend] JWT_SECRET is not set. Using insecure dev default. Set JWT_SECRET in backend/.env');
  process.env.JWT_SECRET = "dev-insecure-secret";
}

app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: frontendOrigin,
    credentials: false,
  }),
);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/todos", requireAuth, todosRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[backend] listening on http://localhost:${port}`);
});


