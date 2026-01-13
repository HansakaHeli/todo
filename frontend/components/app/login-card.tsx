"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth";

export function LoginCard() {
  const { login } = useAuth();
  const [email, setEmail] = useState("alice@example.com");
  const [password, setPassword] = useState("Alice#2026!");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit() {
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success("Signed in");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-4xl items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Todo ABAC</CardTitle>
          <CardDescription>
            Sign in with the users stored in your database (JWT auth).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
            />
          </div>
          <Button className="w-full" onClick={onSubmit} disabled={isSubmitting || !email || !password}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-sm text-muted-foreground">
            This uses your backend `POST /api/auth/login` which returns a JWT stored in your browser.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


