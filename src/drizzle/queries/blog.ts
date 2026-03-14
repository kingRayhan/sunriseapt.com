import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { blogPostsTable } from "../schema";
import type { NewBlogPost } from "../schema";

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

/** All posts for dashboard (including unpublished). */
export async function getAllPosts() {
  return db
    .select()
    .from(blogPostsTable)
    .orderBy(desc(blogPostsTable.date));
}

export async function getPostById(id: string) {
  const rows = await db
    .select()
    .from(blogPostsTable)
    .where(eq(blogPostsTable.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createPost(data: NewBlogPost) {
  const [row] = await db
    .insert(blogPostsTable)
    .values(data)
    .returning();
  return row;
}

export async function updatePost(
  id: string,
  data: Partial<Omit<NewBlogPost, "id" | "createdAt">>,
) {
  const [row] = await db
    .update(blogPostsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(blogPostsTable.id, id))
    .returning();
  return row;
}

export async function deletePost(id: string) {
  await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id));
}
