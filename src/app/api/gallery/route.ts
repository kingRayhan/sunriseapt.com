import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { createGalleryImage } from "@/drizzle/queries/gallery";
import { z } from "zod";

export async function POST(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();

    const createBodySchema = z
      .object({
        imageKey: z.preprocess(
          (v) => (typeof v === "string" ? v.trim() : v),
          z.string().min(1),
        ),
        altText: z.preprocess(
          (v) => {
            if (v == null) return null;
            if (typeof v === "string") return v;
            return null;
          },
          z.string().nullable().optional(),
        ),
        sortOrder: z.preprocess(
          (v) => {
            if (v == null || v === "") return 0;
            if (typeof v === "number") return v;
            if (typeof v === "string") {
              const n = parseInt(v, 10);
              return Number.isNaN(n) ? 0 : n;
            }
            return 0;
          },
          z.number().int(),
        ),
      })
      .strict();

    const parsed = createBodySchema.parse(body);

    const row = await createGalleryImage({
      imageKey: parsed.imageKey,
      altText: parsed.altText ?? null,
      sortOrder: parsed.sortOrder,
    });
    return NextResponse.json(row);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: err.issues },
        { status: 400 },
      );
    }
    const message =
      err instanceof Error ? err.message : "Failed to create gallery image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
