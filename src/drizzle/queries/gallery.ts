import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { galleryImagesTable } from "../schema";
import type { NewGalleryImage } from "../schema";

export async function getGalleryImages() {
  return db
    .select()
    .from(galleryImagesTable)
    .orderBy(asc(galleryImagesTable.sortOrder));
}

export async function getGalleryImageById(id: string) {
  const rows = await db
    .select()
    .from(galleryImagesTable)
    .where(eq(galleryImagesTable.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createGalleryImage(data: NewGalleryImage) {
  const [row] = await db.insert(galleryImagesTable).values(data).returning();
  return row;
}

export async function deleteGalleryImageById(id: string) {
  const [deleted] = await db
    .delete(galleryImagesTable)
    .where(eq(galleryImagesTable.id, id))
    .returning({ imageKey: galleryImagesTable.imageKey });
  return deleted;
}
