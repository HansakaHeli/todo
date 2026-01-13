export type TodoStatus = "draft" | "in_progress" | "completed";

export type Todo = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  status: TodoStatus;
  createdAt: string;
  updatedAt: string;
};


