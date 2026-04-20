import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/require-auth";
import {
  createTestimonial,
  getAllTestimonials,
  getNextSortOrder,
} from "@/drizzle/queries/testimonials";
import type { NewTestimonial } from "@/drizzle/schema";

const trimToUndefined = (v: unknown) =>
  typeof v === "string" ? (v.trim() === "" ? undefined : v.trim()) : v;

const stringOrNullSchema = z.preprocess((v) => {
  if (v == null) return null;
  if (typeof v === "string") return v.trim() || null;
  return null;
}, z.string().nullable());

const intSchema = z.preprocess((v) => {
  if (v == null || v === "") return undefined;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}, z.number().int().optional());

const createBodySchema = z
  .object({
    title: z.preprocess(trimToUndefined, z.string().min(1)),
    shortDescription: z.preprocess(trimToUndefined, z.string().min(1)),
    authorName: z.preprocess(trimToUndefined, z.string().min(1)),
    authorTitle: z.preprocess(trimToUndefined, z.string().min(1)),
    projectBrand: z.preprocess(trimToUndefined, z.string().min(1)),
    overlayLine: z.preprocess(
      (v) => (v === undefined ? null : v),
      stringOrNullSchema,
    ),
    videoUrl: z.preprocess(trimToUndefined, z.string().min(1)),
    posterKey: z.preprocess(trimToUndefined, z.string().min(1)),
    sortOrder: intSchema.optional(),
    published: z.preprocess((v) => Boolean(v), z.boolean()).optional(),
  })
  .strict();

async function parseBody(body: unknown): Promise<NewTestimonial> {
  const parsed = createBodySchema.parse(body);
  const sortOrder = parsed.sortOrder ?? (await getNextSortOrder());
  return {
    title: parsed.title,
    shortDescription: parsed.shortDescription,
    authorName: parsed.authorName,
    authorTitle: parsed.authorTitle,
    projectBrand: parsed.projectBrand,
    overlayLine: parsed.overlayLine ?? null,
    videoUrl: parsed.videoUrl,
    posterKey: parsed.posterKey,
    sortOrder,
    published: parsed.published ?? true,
  };
}

export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const rows = await getAllTestimonials();
    return NextResponse.json(rows);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to list testimonials";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const data = await parseBody(body);
    const row = await createTestimonial(data);
    return NextResponse.json(row);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: err.issues },
        { status: 400 },
      );
    }
    const message =
      err instanceof Error ? err.message : "Failed to create testimonial";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

