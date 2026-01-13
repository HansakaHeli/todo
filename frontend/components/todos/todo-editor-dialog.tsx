"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Todo, TodoStatus } from "@/lib/todos/types";

type Props = {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todo?: Todo;
  onSubmit: (input: { title: string; description: string; status: TodoStatus }) => void;
  isSubmitting?: boolean;
  canEditStatus?: boolean;
};

const STATUS_OPTIONS: { value: TodoStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

export function TodoEditorDialog({
  mode,
  open,
  onOpenChange,
  todo,
  onSubmit,
  isSubmitting,
  canEditStatus = true,
}: Props) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<TodoStatus>("draft");

  React.useEffect(() => {
    if (!open) return;
    setTitle(todo?.title ?? "");
    setDescription(todo?.description ?? "");
    setStatus(todo?.status ?? "draft");
  }, [open, todo]);

  const submitDisabled = !title.trim() || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create todo" : "Edit todo"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new todo with title, description, and status."
              : "Update the todo details and status."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Write project plan"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a bit more detail…"
              rows={4}
            />
          </div>

          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TodoStatus)} disabled={!canEditStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!canEditStatus ? (
              <p className="text-xs text-muted-foreground">You don’t have permission to change status.</p>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit({ title, description, status })}
            disabled={submitDisabled}
          >
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


