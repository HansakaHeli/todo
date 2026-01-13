import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { z } from "zod";

import { getAuthContextByUserId, getUserByEmail } from "../auth/service";
import { requireAuth } from "../middleware/auth";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Bad Request", issues: parsed.error.issues });

  const { email, password } = parsed.data;
  const user = await getUserByEmail(email.toLowerCase());
  if (!user) return res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "Server Misconfigured", message: "Missing JWT_SECRET" });

  const token = jwt.sign({ sub: user.id }, secret, { expiresIn: "7d" });
  const ctx = await getAuthContextByUserId(user.id);

  res.json({
    token,
    session: ctx,
  });
});

router.get("/me", requireAuth, async (req, res) => {
  res.json({ session: req.auth });
});

export default router;


