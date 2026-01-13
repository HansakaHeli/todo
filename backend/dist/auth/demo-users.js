export const DEMO_USERS = [
    { id: "u_alice", name: "Alice", role: "user" },
    { id: "u_bob", name: "Bob", role: "user" },
    { id: "u_mona", name: "Mona", role: "manager" },
    { id: "u_ada", name: "Ada", role: "admin" },
];
export function getDemoUserById(id) {
    if (!id)
        return null;
    return DEMO_USERS.find((u) => u.id === id) ?? null;
}
