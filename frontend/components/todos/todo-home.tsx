"use client";

import * as React from "react";
import { toast } from "sonner";

import { TodoEditorDialog } from "@/components/todos/todo-editor-dialog";
import { TodoStatusBadge } from "@/components/todos/todo-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { canTodo } from "@/lib/abac";
import { useAuth } from "@/lib/auth/auth";
import { useTodos } from "@/lib/todos/hooks";
import type { Todo, TodoStatus } from "@/lib/todos/types";

export function TodoHome() {
  const { session, token, logout } = useAuth();
  const { query, todos, createTodo, updateTodo, deleteTodo } = useTodos(session!, token!);

  const [filter, setFilter] = React.useState<"all" | TodoStatus>("all");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTodo, setEditTodo] = React.useState<Todo | null>(null);
  const [deleteTodoId, setDeleteTodoId] = React.useState<string | null>(null);

  const filteredTodos = React.useMemo(() => {
    if (filter === "all") return todos;
    return todos.filter((t) => t.status === filter);
  }, [filter, todos]);

  const canCreate = canTodo(session!, "create").allowed;

  async function handleCreate(input: { title: string; description: string; status: TodoStatus }) {
    try {
      await createTodo.mutateAsync(input);
      setCreateOpen(false);
      toast.success("Todo created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create todo");
    }
  }

  async function handleUpdate(todo: Todo, input: { title: string; description: string; status: TodoStatus }) {
    try {
      await updateTodo.mutateAsync({ id: todo.id, ...input });
      setEditTodo(null);
      toast.success("Todo updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update todo");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTodo.mutateAsync(id);
      setDeleteTodoId(null);
      toast.success("Todo deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete todo");
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Todos</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{session?.user.name}</span>
            {session?.roles?.length ? (
              <>
                {" "}
                (<span className="font-mono">{session.roles.join(", ")}</span>)
              </>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate ? (
            <Button onClick={() => setCreateOpen(true)}>Create todo</Button>
          ) : (
            <Button disabled title={canTodo(session!, "create").reason}>
              Create todo
            </Button>
          )}
          <Button variant="secondary" onClick={logout}>
            Sign out
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Permissions (ABAC)</CardTitle>
          <CardDescription>
            View is role-based; delete depends on role + todo status + ownership.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="grid gap-2 sm:grid-cols-3">
            <div>
              <div className="font-medium">User</div>
              <div className="text-muted-foreground">
                Can CRUD own todos. Can delete only if status is <span className="font-mono">draft</span>.
              </div>
            </div>
            <div>
              <div className="font-medium">Manager</div>
              <div className="text-muted-foreground">Can view all todos (read-only).</div>
            </div>
            <div>
              <div className="font-medium">Admin</div>
              <div className="text-muted-foreground">Can view all. Can delete any todo.</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="in_progress">In progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="text-sm text-muted-foreground">
          {query.isLoading ? "Loading…" : `${filteredTodos.length} todo(s)`}
        </div>
      </div>

      {query.isError ? (
        <Card className="mb-4 border-destructive/40">
          <CardContent className="p-5 text-sm">
            <div className="font-medium text-destructive">Backend request failed</div>
            <div className="mt-1 text-muted-foreground">
              {query.error instanceof Error ? query.error.message : "Could not load todos from the API."}
            </div>
            <div className="mt-3 text-muted-foreground">
              Make sure the backend is running and configured with <span className="font-mono">DATABASE_URL</span>{" "}
              (see <span className="font-mono">backend/env.example</span>).
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3">
        {filteredTodos.map((t) => {
          const canUpdate = canTodo(session!, "update", t);
          const canDelete = canTodo(session!, "delete", t);
          return (
            <Card key={t.id}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate font-medium">{t.title}</div>
                      <TodoStatusBadge status={t.status} />
                    </div>
                    <div className="mt-1 line-clamp-3 text-sm text-muted-foreground">{t.description}</div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Owner: <span className="font-mono">{t.ownerId}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => (canUpdate.allowed ? setEditTodo(t) : toast.error(canUpdate.reason ?? "Not allowed"))}
                      disabled={!canUpdate.allowed || updateTodo.isPending}
                      title={canUpdate.allowed ? undefined : canUpdate.reason}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        canDelete.allowed ? setDeleteTodoId(t.id) : toast.error(canDelete.reason ?? "Not allowed")
                      }
                      disabled={!canDelete.allowed || deleteTodo.isPending}
                      title={canDelete.allowed ? undefined : canDelete.reason}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {!query.isLoading && filteredTodos.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">No todos match this filter.</CardContent>
          </Card>
        ) : null}
      </div>

      <TodoEditorDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        isSubmitting={createTodo.isPending}
        canEditStatus={canCreate}
      />

      <TodoEditorDialog
        mode="edit"
        open={!!editTodo}
        onOpenChange={(open) => {
          if (!open) setEditTodo(null);
        }}
        todo={editTodo ?? undefined}
        onSubmit={(input) => (editTodo ? handleUpdate(editTodo, input) : undefined)}
        isSubmitting={updateTodo.isPending}
        canEditStatus={canTodo(session!, "update", editTodo ?? undefined).allowed}
      />

      <Dialog
        open={!!deleteTodoId}
        onOpenChange={(open) => {
          if (!open) setDeleteTodoId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete todo?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <Separator />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteTodoId(null)} disabled={deleteTodo.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTodoId && handleDelete(deleteTodoId)}
              disabled={deleteTodo.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


