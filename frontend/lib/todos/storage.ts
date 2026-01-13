"use client";

import type { Todo, TodoStatus } from "./types";

const STORAGE_KEY = "todo2.todos.v1";

function safeParseTodos(raw: string | null): Todo[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTodo);
  } catch {
    return [];
  }
}

function isTodoStatus(v: unknown): v is TodoStatus {
  return v === "draft" || v === "in_progress" || v === "completed";
}

function isTodo(v: unknown): v is Todo {
  if (!v || typeof v !== "object") return false;
  const t = v as Partial<Todo>;
  return (
    typeof t.id === "string" &&
    typeof t.ownerId === "string" &&
    typeof t.title === "string" &&
    typeof t.description === "string" &&
    isTodoStatus(t.status) &&
    typeof t.createdAt === "string" &&
    typeof t.updatedAt === "string"
  );
}

function seedIfEmpty(todos: Todo[]): Todo[] {
  if (todos.length > 0) return todos;
  const now = new Date().toISOString();
  const seeded: Todo[] = [
    {
      id: "t_seed_1",
      ownerId: "u_alice",
      title: "Draft: outline project",
      description: "Write a short plan and break down tasks.",
      status: "draft",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "t_seed_2",
      ownerId: "u_alice",
      title: "Implement UI skeleton",
      description: "App shell, list view, and edit dialog.",
      status: "in_progress",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "t_seed_3",
      ownerId: "u_bob",
      title: "Ship MVP",
      description: "Finish CRUD flow and validate permissions.",
      status: "completed",
      createdAt: now,
      updatedAt: now,
    },
  ];
  return seeded;
}

export function getAllTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  const todos = seedIfEmpty(safeParseTodos(localStorage.getItem(STORAGE_KEY)));
  if (todos.length === 0) return todos;
  // Persist seeding if needed
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  return todos;
}

export function setAllTodos(todos: Todo[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export function upsertTodo(next: Todo) {
  const todos = getAllTodos();
  const idx = todos.findIndex((t) => t.id === next.id);
  const updated = idx >= 0 ? [...todos.slice(0, idx), next, ...todos.slice(idx + 1)] : [next, ...todos];
  setAllTodos(updated);
}

export function deleteTodoById(id: string) {
  const todos = getAllTodos();
  setAllTodos(todos.filter((t) => t.id !== id));
}


