import { NextResponse } from "next/server";
import { uploadS3Object } from "@/lib/s3";

function getExtension(fileName: string, mimeType: string): string {
  const fromName = fileName.split(".").pop()?.toLowerCase();
  if (fromName) return fromName;
  if (mimeType.startsWith("image/")) return mimeType.split("/")[1] || "jpg";
  if (mimeType === "application/pdf") return "pdf";
  return "bin";
}

function generateKey(prefix: string, fileName: string, mimeType: string): string {
  const ext = getExtension(fileName, mimeType);
  return `${prefix}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
}

/**
 * POST /api/storage/upload – upload a file to S3/R2 from the server (same-origin).
 * Body: multipart/form-data with "file" and optional "prefix" (default "gallery").
 * - prefix "gallery": images only. Returns { key } for gallery.
 * - prefix "blog": images only. Returns { key } for blog feature image.
 * - prefix "hero": images only. Returns { key } for home slider.
 * - prefix "brochures": PDFs (and optionally other docs). Returns { key } for brochure.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const prefix = (formData.get("prefix") as string)?.trim() || "gallery";
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing or invalid 'file' in form data" },
        { status: 400 }
      );
    }
    if ((prefix === "gallery" || prefix === "blog" || prefix === "hero") && !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Upload must be an image" },
        { status: 400 }
      );
    }
    if (prefix === "brochures" && file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Brochure must be a PDF file" },
        { status: 400 }
      );
    }
    const key = generateKey(prefix, file.name, file.type);
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
