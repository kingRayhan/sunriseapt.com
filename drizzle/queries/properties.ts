import { eq, and, ne, desc } from "drizzle-orm";
import { db } from "../db";
import { properties } from "../schema";

export async function getProperties() {
  return db
    .select()
    .from(properties)
    .where(eq(properties.status, "available"))
    .orderBy(desc(properties.createdAt));
}

export async function getFeaturedProperties() {
  return db
    .select()
    .from(properties)
    .where(
      and(eq(properties.featured, true), eq(properties.status, "available")),
    )
    .orderBy(desc(properties.createdAt));
}

export async function getPropertyBySlug(slug: string) {
  const rows = await db
    .select()
    .from(properties)
    .where(eq(properties.slug, slug))
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
    .from(properties)
    .where(
      and(
        eq(properties.type, type),
        ne(properties.id, currentId),
        eq(properties.status, "available"),
      ),
    )
    .limit(limit);
}
