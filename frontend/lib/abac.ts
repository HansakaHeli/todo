import type { Session } from "@/lib/auth/auth";
import type { Todo } from "@/lib/todos/types";

export type TodoAction = "view" | "create" | "update" | "delete";

export type Decision = {
  allowed: boolean;
  reason?: string;
};

export const PRIV = {
  TODO_VIEW_ALL: "todo:view:all",
  TODO_VIEW_OWN: "todo:view:own",
  TODO_CREATE_OWN: "todo:create:own",
  TODO_UPDATE_OWN: "todo:update:own",
  TODO_DELETE_OWN_DRAFT: "todo:delete:own:draft",
  TODO_DELETE_ANY: "todo:delete:any",
} as const;

function has(session: Session, privilegeKey: string) {
  return session.privileges.includes(privilegeKey);
}

export function canTodo(session: Session, action: TodoAction, todo?: Todo): Decision {
  const userId = session.user.id;

  if (action === "create") {
    return has(session, PRIV.TODO_CREATE_OWN) ? { allowed: true } : { allowed: false, reason: "Not allowed." };
  }

  if (action === "update") {
    if (!has(session, PRIV.TODO_UPDATE_OWN)) return { allowed: false, reason: "Not allowed." };
    if (!todo) return { allowed: false, reason: "Missing todo context." };
    if (todo.ownerId !== userId) return { allowed: false, reason: "Can only update your own todos." };
    return { allowed: true };
  }

  if (action === "delete") {
    if (!todo) return { allowed: false, reason: "Missing todo context." };
    if (has(session, PRIV.TODO_DELETE_ANY)) return { allowed: true };
    if (!has(session, PRIV.TODO_DELETE_OWN_DRAFT)) return { allowed: false, reason: "Not allowed." };
    if (todo.ownerId !== userId) return { allowed: false, reason: "Can only delete your own todos." };
    if (todo.status !== "draft") return { allowed: false, reason: 'Can only delete todos in "draft" status.' };
    return { allowed: true };
  }

  // view: allow if you can view all, otherwise you can view if you have "view own" and it's your todo.
  if (has(session, PRIV.TODO_VIEW_ALL)) return { allowed: true };
  if (!has(session, PRIV.TODO_VIEW_OWN)) return { allowed: false, reason: "Not allowed." };
  if (!todo) return { allowed: true }; // list view handled by backend anyway
  return todo.ownerId === userId ? { allowed: true } : { allowed: false, reason: "Not allowed." };
}

export function visibleTodosFor(session: Session, todos: Todo[]): Todo[] {
  if (session.privileges.includes(PRIV.TODO_VIEW_ALL)) return todos;
  return todos.filter((t) => t.ownerId === session.user.id);
}


