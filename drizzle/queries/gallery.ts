import { asc } from "drizzle-orm";
import { db } from "../db";
import { galleryImages } from "../schema";

export async function getGalleryImages() {
  return db
    .select()
    .from(galleryImages)
    .orderBy(asc(galleryImages.sortOrder));
}
