import {
  deleteProperty,
  getPropertyById,
  updateProperty,
} from "@/drizzle/queries/properties";
import type { NewProperty } from "@/drizzle/schema";
import { requireAuth } from "@/lib/require-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const projectDetailSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const trimToUndefined = (v: unknown) =>
  typeof v === "string" ? (v.trim() === "" ? undefined : v.trim()) : v;

const numericStringSchema = z.preprocess((v) => {
  if (v == null) return undefined;
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return v.trim() || undefined;
  return undefined;
}, z.string().optional());

const intSchema = z.preprocess((v) => {
  if (v == null || v === "") return undefined;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}, z.number().int().optional());

const floatSchema = z.preprocess((v) => {
  if (v == null || v === "") return undefined;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}, z.number().optional());

const stringOrNullSchema = z.preprocess((v) => {
  if (v === undefined) return undefined; // PATCH: absent means "don't touch"
  if (v == null) return null;
  if (typeof v === "string") return v.trim() || null;
  return null;
}, z.string().nullable().optional());

const stringArraySchema = z.preprocess((v) => {
  if (v === undefined) return undefined; // PATCH semantics
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    const t = v.trim();
    if (!t) return [];
    return t
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}, z.array(z.string()).optional());

const patchBodySchema = z
  .object({
    title: z.preprocess(trimToUndefined, z.string().min(1).optional()),
    slug: z.preprocess(trimToUndefined, z.string().min(1).optional()),
    description: stringOrNullSchema,
    price: numericStringSchema,
    type: z.preprocess(trimToUndefined, z.string().min(1).optional()),
    status: z.preprocess(trimToUndefined, z.string().min(1).optional()),
    bedrooms: intSchema,
    bathrooms: intSchema,
    area: numericStringSchema,
    // In DB schema, yearBuilt is a varchar, so keep it as a string.
    yearBuilt: numericStringSchema,
    location: stringOrNullSchema,
    address: stringOrNullSchema,
    lat: floatSchema,
    lng: floatSchema,
    featured: z.preprocess(
      (v) => (v === undefined ? undefined : Boolean(v)),
      z.boolean().optional(),
    ),
    images: stringArraySchema,
    features: stringArraySchema,
    projectDetails: z.preprocess(
      (v) => (v === undefined ? undefined : v),
      z.array(projectDetailSchema).optional(),
    ),
    brochureKey: z.preprocess((v) => {
      if (v === undefined) return undefined;
      if (v == null) return null;
      if (typeof v === "string") return v.trim() || null;
      return null;
    }, z.string().nullable().optional()),
  })
  .strict();

function parseBody(body: unknown): Partial<NewProperty> {
  const parsed = patchBodySchema.parse(body);
  const out: Partial<NewProperty> = {
    ...parsed,
    projectDetails: parsed.projectDetails
      ? parsed.projectDetails.map((x) => ({ label: x.label, value: x.value }))
      : undefined,
  };

  // If title is provided and slug is not, generate slug from title.
  if (out.title && !out.slug) {
    out.slug = slugify(out.title);
  }

  // Normalize numeric strings.
  if (out.price !== undefined) out.price = out.price || "0";
  if (out.area !== undefined) out.area = out.area || "0";

  // Ensure non-negative ints where applicable.
  if (out.bedrooms !== undefined && out.bedrooms < 0) out.bedrooms = 0;
  if (out.bathrooms !== undefined && out.bathrooms < 0) out.bathrooms = 0;

  return out;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    const property = await getPropertyById(id);
    if (!property)
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    return NextResponse.json(property);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to get property";
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
    const property = await getPropertyById(id);
    if (!property)
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    const body = await request.json();
    const data = parseBody(body);
    const updated = await updateProperty(id, data);
    return NextResponse.json(updated);
  } catch (err) {
    console.log(JSON.stringify(err, null, 2));
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: err.issues },
        { status: 400 },
      );
    }
    const message =
      err instanceof Error ? err.message : "Failed to update property";
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
    const property = await getPropertyById(id);
    if (!property)
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    await deleteProperty(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete property";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
