"use client";

import { LoginCard } from "@/components/app/login-card";
import { TodoHome } from "@/components/todos/todo-home";
import { useAuth } from "@/lib/auth/auth";

export default function Home() {
  const { session } = useAuth();

  return (
    <div className="min-h-dvh bg-gradient-to-b from-background to-muted/40">
      {session ? <TodoHome /> : <LoginCard />}
    </div>
  );
}
