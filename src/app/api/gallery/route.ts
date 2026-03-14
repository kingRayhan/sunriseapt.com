import { NextResponse } from "next/server";
import { createGalleryImage } from "@/drizzle/queries/gallery";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageKey, altText, sortOrder } = body as {
      imageKey?: string;
      altText?: string;
      sortOrder?: number;
    };
    if (!imageKey || typeof imageKey !== "string" || imageKey.trim() === "") {
      return NextResponse.json(
        { error: "Missing or invalid 'imageKey'" },
        { status: 400 }
      );
    }
    const row = await createGalleryImage({
      imageKey: imageKey.trim(),
      altText: typeof altText === "string" ? altText : null,
      sortOrder:
        typeof sortOrder === "number" && Number.isInteger(sortOrder)
          ? sortOrder
          : 0,
    });
    return NextResponse.json(row);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create gallery image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
