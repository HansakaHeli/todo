"use client";

import { Badge } from "@/components/ui/badge";
import type { TodoStatus } from "@/lib/todos/types";

const LABEL: Record<TodoStatus, string> = {
  draft: "Draft",
  in_progress: "In progress",
  completed: "Completed",
};

const CLASSNAME: Record<TodoStatus, string> = {
  draft: "bg-muted text-muted-foreground hover:bg-muted",
  in_progress: "bg-blue-500/10 text-blue-700 hover:bg-blue-500/10 dark:text-blue-300",
  completed: "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300",
};

export function TodoStatusBadge({ status }: { status: TodoStatus }) {
  return (
    <Badge variant="secondary" className={CLASSNAME[status]}>
      {LABEL[status]}
    </Badge>
  );
}


