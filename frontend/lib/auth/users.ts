export type Role = "user" | "manager" | "admin";

export type AppUser = {
  id: string;
  name: string;
  role: Role;
};

export const DEMO_USERS: AppUser[] = [
  { id: "u_alice", name: "Alice", role: "user" },
  { id: "u_bob", name: "Bob", role: "user" },
  { id: "u_mona", name: "Mona", role: "manager" },
  { id: "u_ada", name: "Ada", role: "admin" },
];


