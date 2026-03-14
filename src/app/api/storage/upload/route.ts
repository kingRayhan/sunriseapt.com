import { NextResponse } from "next/server";
import { uploadS3Object } from "@/lib/s3";

function generateKey(fileName: string, mimeType: string): string {
  const ext =
    fileName.split(".").pop()?.toLowerCase() ||
    (mimeType.startsWith("image/") ? mimeType.split("/")[1] || "jpg" : "jpg");
  return `gallery/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
}

/**
 * POST /api/storage/upload – upload a file to S3/R2 from the server (same-origin).
 * Use this to avoid CORS when the bucket does not allow your app origin.
 * Body: multipart/form-data with field "file" (the image file).
 * Returns: { key } for use with POST /api/gallery.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing or invalid 'file' in form data" },
        { status: 400 }
      );
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }
    const key = generateKey(file.name, file.type);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await uploadS3Object(key, buffer, file.type);
    return NextResponse.json({ key });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to upload file";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Missing S3") ? 503 : 500 }
    );
  }
}
