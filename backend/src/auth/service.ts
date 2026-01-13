import { eq } from "drizzle-orm";

import { db } from "../db";
import { privileges, rolePrivileges, roles, userRoles, users } from "../db/schema";
import type { AuthContext } from "./types";

export async function getAuthContextByUserId(userId: string): Promise<AuthContext | null> {
  const u = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = u[0];
  if (!user) return null;

  const roleRows = await db
    .select({ name: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, user.id));

  const privilegeRows = await db
    .selectDistinct({ key: privileges.key })
    .from(userRoles)
    .innerJoin(rolePrivileges, eq(userRoles.roleId, rolePrivileges.roleId))
    .innerJoin(privileges, eq(rolePrivileges.privilegeId, privileges.id))
    .where(eq(userRoles.userId, user.id));

  return {
    user: { id: user.id, email: user.email, name: user.name },
    roles: roleRows.map((r) => r.name),
    privileges: privilegeRows.map((p) => p.key),
  };
}

export async function getUserByEmail(email: string) {
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0] ?? null;
}


