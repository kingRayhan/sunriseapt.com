import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { testimonialsTable } from "../schema";
import type { NewTestimonial } from "../schema";

/** Published testimonials for the public site. */
export async function getPublishedTestimonials() {
  return db
    .select()
    .from(testimonialsTable)
    .where(eq(testimonialsTable.published, true))
    .orderBy(asc(testimonialsTable.sortOrder), desc(testimonialsTable.createdAt));
}

/** All testimonials for dashboard (including unpublished). */
export async function getAllTestimonials() {
  return db
    .select()
    .from(testimonialsTable)
    .orderBy(asc(testimonialsTable.sortOrder), desc(testimonialsTable.createdAt));
}

export async function getTestimonialById(id: string) {
  const rows = await db
    .select()
    .from(testimonialsTable)
    .where(eq(testimonialsTable.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createTestimonial(data: NewTestimonial) {
  const [row] = await db.insert(testimonialsTable).values(data).returning();
  return row;
}

export async function updateTestimonial(
  id: string,
  data: Partial<Omit<NewTestimonial, "id" | "createdAt">>,
) {
  const [row] = await db
    .update(testimonialsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(testimonialsTable.id, id))
    .returning();
  return row;
}

export async function deleteTestimonial(id: string) {
  await db.delete(testimonialsTable).where(eq(testimonialsTable.id, id));
}

export async function getNextSortOrder(): Promise<number> {
  const rows = await db
    .select({ sortOrder: testimonialsTable.sortOrder })
    .from(testimonialsTable)
    .orderBy(desc(testimonialsTable.sortOrder))
    .limit(1);
  const max = rows[0]?.sortOrder ?? 0;
  return max + 1;
}

