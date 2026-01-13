import { and, desc, eq } from "drizzle-orm";
import { Router } from "express";
import { z } from "zod";

import { can, PRIV } from "../abac";
import { db } from "../db";
import { todos } from "../db/schema";

const router = Router();

const statusSchema = z.enum(["draft", "in_progress", "completed"]);

const createTodoSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(10_000).default(""),
  status: statusSchema.default("draft"),
});

const updateTodoSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(10_000).default(""),
  status: statusSchema,
});

router.get("/", async (req, res) => {
  const auth = req.auth!;

  const canViewAll = can(auth, "view_all").allowed;
  const canViewOwn =
    can(auth, "view_own").allowed ||
    auth.privileges.includes(PRIV.TODO_CREATE_OWN) ||
    auth.privileges.includes(PRIV.TODO_UPDATE_OWN) ||
    auth.privileges.includes(PRIV.TODO_DELETE_OWN_DRAFT) ||
    auth.privileges.includes(PRIV.TODO_DELETE_ANY);
  if (!canViewAll && !canViewOwn) {
    return res.status(403).json({
      error: "Forbidden",
      message: `Missing privilege (${PRIV.TODO_VIEW_ALL} or ${PRIV.TODO_VIEW_OWN})`,
    });
  }

  const rows = canViewAll
    ? await db.select().from(todos).orderBy(desc(todos.updatedAt))
    : await db.select().from(todos).where(eq(todos.ownerId, auth.user.id)).orderBy(desc(todos.updatedAt));

  res.json({ todos: rows });
});

router.post("/", async (req, res) => {
  const auth = req.auth!;

  const decision = can(auth, "create_own");
  if (!decision.allowed) return res.status(403).json({ error: "Forbidden", message: decision.reason });

  const input = createTodoSchema.safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: "Bad Request", issues: input.error.issues });

  const [created] = await db
    .insert(todos)
    .values({
      ownerId: auth.user.id,
      title: input.data.title.trim(),
      description: input.data.description.trim(),
      status: input.data.status,
      updatedAt: new Date(),
    })
    .returning();

  res.status(201).json({ todo: created });
});

router.patch("/:id", async (req, res) => {
  const auth = req.auth!;
  const id = req.params.id;

  const input = updateTodoSchema.safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: "Bad Request", issues: input.error.issues });

  const existing = await db.select().from(todos).where(eq(todos.id, id)).limit(1);
  const todo = existing[0];
  if (!todo) return res.status(404).json({ error: "Not Found" });

  const decision = can(auth, "update_own", { id: todo.id, ownerId: todo.ownerId, status: todo.status });
  if (!decision.allowed) return res.status(403).json({ error: "Forbidden", message: decision.reason });

  const whereClause = and(eq(todos.id, id), eq(todos.ownerId, auth.user.id));

  const [updated] = await db
    .update(todos)
    .set({
      title: input.data.title.trim(),
      description: input.data.description.trim(),
      status: input.data.status,
      updatedAt: new Date(),
    })
    .where(whereClause)
    .returning();

  // The ABAC check above is the source of truth; this is a fallback.
  if (!updated) return res.status(403).json({ error: "Forbidden" });

  res.json({ todo: updated });
});

router.delete("/:id", async (req, res) => {
  const auth = req.auth!;
  const id = req.params.id;

  const existing = await db.select().from(todos).where(eq(todos.id, id)).limit(1);
  const todo = existing[0];
  if (!todo) return res.status(404).json({ error: "Not Found" });

  const resource = { id: todo.id, ownerId: todo.ownerId, status: todo.status };
  const canDeleteAny = can(auth, "delete_any").allowed;
  const decision = canDeleteAny ? { allowed: true } : can(auth, "delete_own_draft", resource);
  if (!decision.allowed) return res.status(403).json({ error: "Forbidden", message: decision.reason });

  await db.delete(todos).where(eq(todos.id, id));

  res.status(204).send();
});

export default router;


