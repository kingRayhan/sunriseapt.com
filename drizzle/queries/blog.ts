import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { blogPosts } from "../schema";

export async function getPublishedPosts() {
  return db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.date));
}

export async function getPostBySlug(slug: string) {
  const rows = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
    .limit(1);

  return rows[0] ?? null;
}
