import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { blogPostsTable } from "../schema";

export async function getPublishedPosts() {
  return db
    .select()
    .from(blogPostsTable)
    .where(eq(blogPostsTable.published, true))
    .orderBy(desc(blogPostsTable.date));
}

export async function getPostBySlug(slug: string) {
  const rows = await db
    .select()
    .from(blogPostsTable)
    .where(and(eq(blogPostsTable.slug, slug), eq(blogPostsTable.published, true)))
    .limit(1);

  return rows[0] ?? null;
}
