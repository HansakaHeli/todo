"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { canTodo, visibleTodosFor } from "@/lib/abac";
import type { Session } from "@/lib/auth/auth";
import type { Todo, TodoStatus } from "@/lib/todos/types";

export type CreateTodoInput = {
  title: string;
  description: string;
  status: TodoStatus;
};

export type UpdateTodoInput = {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
};

export function useTodos(session: Session, token: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["todos", "v1", session.user.id],
    queryFn: async () => {
      const res = await apiFetch<{ todos: Todo[] }>("/api/todos", { token });
      return res.todos;
    },
  });

  const visible = query.data ? visibleTodosFor(session, query.data) : [];

  const createMutation = useMutation({
    mutationFn: async (input: CreateTodoInput) => {
      const decision = canTodo(session, "create");
      if (!decision.allowed) throw new Error(decision.reason ?? "Not allowed.");

      const res = await apiFetch<{ todo: Todo }>("/api/todos", {
        method: "POST",
        token,
        body: JSON.stringify({
          title: input.title,
          description: input.description,
          status: input.status,
        }),
      });
      return res.todo;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["todos", "v1"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (input: UpdateTodoInput) => {
      const existing = query.data?.find((t) => t.id === input.id);
      if (!existing) throw new Error("Todo not found.");
      const decision = canTodo(session, "update", existing);
      if (!decision.allowed) throw new Error(decision.reason ?? "Not allowed.");

      const res = await apiFetch<{ todo: Todo }>(`/api/todos/${input.id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({
          title: input.title,
          description: input.description,
          status: input.status,
        }),
      });
      return res.todo;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["todos", "v1"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const existing = query.data?.find((t) => t.id === id);
      if (!existing) throw new Error("Todo not found.");
      const decision = canTodo(session, "delete", existing);
      if (!decision.allowed) throw new Error(decision.reason ?? "Not allowed.");

      await apiFetch<void>(`/api/todos/${id}`, {
        method: "DELETE",
        token,
      });
      return id;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["todos", "v1"] });
    },
  });

  return {
    query,
    todos: visible,
    createTodo: createMutation,
    updateTodo: updateMutation,
    deleteTodo: deleteMutation,
  };
}


