import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/require-auth";
import {
  deleteTestimonial,
  getTestimonialById,
  updateTestimonial,
} from "@/drizzle/queries/testimonials";
import type { NewTestimonial } from "@/drizzle/schema";

const trimToUndefined = (v: unknown) =>
  typeof v === "string" ? (v.trim() === "" ? undefined : v.trim()) : v;

const stringOrNullSchema = z.preprocess((v) => {
  if (v === undefined) return undefined; // PATCH semantics
  if (v == null) return null;
  if (typeof v === "string") return v.trim() || null;
  return null;
}, z.string().nullable().optional());

const intSchema = z.preprocess((v) => {
  if (v === undefined || v === "") return undefined;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}, z.number().int().optional());

const patchBodySchema = z
  .object({
    title: z.preprocess(trimToUndefined, z.string().min(1).optional()),
    shortDescription: z.preprocess(trimToUndefined, z.string().min(1).optional()),
    authorName: z.preprocess(trimToUndefined, z.string().min(1).optional()),
    authorTitle: z.preprocess(trimToUndefined, z.string().min(1).optional()),
    projectBrand: z.preprocess(trimToUndefined, z.string().min(1).optional()),
    overlayLine: stringOrNullSchema,
    videoUrl: z.preprocess(trimToUndefined, z.string().min(1).optional()),
    posterKey: z.preprocess(trimToUndefined, z.string().min(1).optional()),
    sortOrder: intSchema,
    published: z.preprocess(
      (v) => (v === undefined ? undefined : Boolean(v)),
      z.boolean().optional(),
    ),
  })
  .strict();

function parseBody(
  body: unknown,
): Partial<Omit<NewTestimonial, "id" | "createdAt">> {
  const parsed = patchBodySchema.parse(body);
  return { ...parsed };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    const row = await getTestimonialById(id);
    if (!row)
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 },
      );
    return NextResponse.json(row);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to get testimonial";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    const existing = await getTestimonialById(id);
    if (!existing)
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 },
      );
    const body = await request.json();
    const data = parseBody(body);
    const updated = await updateTestimonial(id, data);
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: err.issues },
        { status: 400 },
      );
    }
    const message =
      err instanceof Error ? err.message : "Failed to update testimonial";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    const existing = await getTestimonialById(id);
    if (!existing)
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 },
      );
    await deleteTestimonial(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete testimonial";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

