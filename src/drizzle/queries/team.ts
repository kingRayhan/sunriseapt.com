import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { teamMembersTable } from "../schema";
import type { NewTeamMember } from "../schema";

export async function getTeamMembers() {
  return db
    .select()
    .from(teamMembersTable)
    .orderBy(asc(teamMembersTable.sortOrder));
}

export async function getTeamMemberById(id: string) {
  const rows = await db
    .select()
    .from(teamMembersTable)
    .where(eq(teamMembersTable.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createTeamMember(data: NewTeamMember) {
  const [row] = await db.insert(teamMembersTable).values(data).returning();
  return row;
}

export async function updateTeamMember(
  id: string,
  data: Partial<Omit<NewTeamMember, "id" | "createdAt">>,
) {
  const [row] = await db
    .update(teamMembersTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(teamMembersTable.id, id))
    .returning();
  return row;
}

export async function deleteTeamMember(id: string) {
  await db.delete(teamMembersTable).where(eq(teamMembersTable.id, id));
}
