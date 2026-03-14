import { eq, and, ne, desc } from "drizzle-orm";
import { db } from "../db";
import { propertiesTable } from "../schema";
import type { NewProperty } from "../schema";

export async function getProperties() {
  return db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.status, "available"))
    .orderBy(desc(propertiesTable.createdAt));
}

/** All properties for dashboard (no status filter). */
export async function getAllProperties() {
  return db
    .select()
    .from(propertiesTable)
    .orderBy(desc(propertiesTable.createdAt));
}

export async function getPropertyById(id: string) {
  const rows = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getFeaturedProperties() {
  return db
    .select()
    .from(propertiesTable)
    .where(
      and(
        eq(propertiesTable.featured, true),
        eq(propertiesTable.status, "available"),
      ),
    )
    .orderBy(desc(propertiesTable.createdAt));
}

export async function getPropertyBySlug(slug: string) {
  const rows = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.slug, slug))
    .limit(1);

  return rows[0] ?? null;
}

export async function getRelatedProperties(
  currentId: string,
  type: string,
  limit = 3,
) {
  return db
    .select()
    .from(propertiesTable)
    .where(
      and(
        eq(propertiesTable.type, type),
        ne(propertiesTable.id, currentId),
        eq(propertiesTable.status, "available"),
      ),
    )
    .limit(limit);
}

export async function createProperty(data: NewProperty) {
  const [row] = await db
    .insert(propertiesTable)
    .values(data)
    .returning();
  return row;
}

export async function updateProperty(
  id: string,
  data: Partial<Omit<NewProperty, "id" | "createdAt">>
) {
  const [row] = await db
    .update(propertiesTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(propertiesTable.id, id))
    .returning();
  return row;
}

export async function deleteProperty(id: string) {
  const [row] = await db
    .delete(propertiesTable)
    .where(eq(propertiesTable.id, id))
    .returning({ id: propertiesTable.id });
  return row;
}
