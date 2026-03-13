import { asc } from "drizzle-orm";
import { db } from "../db";
import { galleryImagesTable } from "../schema";

export async function getGalleryImages() {
  return db
    .select()
    .from(galleryImagesTable)
    .orderBy(asc(galleryImagesTable.sortOrder));
}
