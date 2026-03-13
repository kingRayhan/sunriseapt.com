import { asc } from "drizzle-orm";
import { db } from "../db";
import { teamMembers } from "../schema";

export async function getTeamMembers() {
  return db
    .select()
    .from(teamMembers)
    .orderBy(asc(teamMembers.sortOrder));
}
