import { NextResponse } from "next/server";
import {
  deleteGalleryImageById,
  getGalleryImageById,
} from "@/drizzle/queries/gallery";
import { deleteS3Object } from "@/lib/s3";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const image = await getGalleryImageById(id);
    if (!image) {
      return NextResponse.json({ error: "Gallery image not found" }, { status: 404 });
    }
    try {
      await deleteS3Object(image.imageKey);
    } catch (s3Err) {
      // Log but still delete DB row so we don't leave orphan records
      console.error("S3 delete failed for key:", image.imageKey, s3Err);
    }
    await deleteGalleryImageById(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete gallery image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
