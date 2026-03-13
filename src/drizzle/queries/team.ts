import { asc } from "drizzle-orm";
import { db } from "../db";
import { teamMembersTable } from "../schema";

export async function getTeamMembers() {
  return db
    .select()
    .from(teamMembersTable)
    .orderBy(asc(teamMembersTable.sortOrder));
}
