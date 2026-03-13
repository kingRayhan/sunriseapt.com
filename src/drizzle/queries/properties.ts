"use server";

import { eq, and, ne, desc } from "drizzle-orm";
import { db } from "../db";
import { propertiesTable } from "../schema";

export async function getProperties() {
  return db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.status, "available"))
    .orderBy(desc(propertiesTable.createdAt));
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
