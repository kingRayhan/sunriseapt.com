import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getAllProperties, createProperty } from "@/drizzle/queries/properties";
import type { NewProperty } from "@/drizzle/schema";
import type { ProjectDetail } from "@/drizzle/schema";
import { z } from "zod";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
  if (v == null) return null;
  if (typeof v === "string") return v.trim() || null;
  return null;
}, z.string().nullable());

const stringArraySchema = z.preprocess((v) => {
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
}, z.array(z.string()));

const projectDetailSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const createBodySchema = z
  .object({
    title: z.preprocess(trimToUndefined, z.string().min(1)),
    slug: z.preprocess(trimToUndefined, z.string().min(1)).optional(),
    description: z.preprocess(
      (v) => (v === undefined ? null : v),
      stringOrNullSchema,
    ),
    price: numericStringSchema.optional(),
    type: z.preprocess(trimToUndefined, z.string().min(1)).optional(),
    status: z.preprocess(trimToUndefined, z.string().min(1)).optional(),
    bedrooms: intSchema.optional(),
    bathrooms: intSchema.optional(),
    area: numericStringSchema.optional(),
    // In DB schema, yearBuilt is a varchar, so keep it as a string.
    yearBuilt: numericStringSchema.optional(),
    location: z
      .preprocess((v) => (v === undefined ? null : v), stringOrNullSchema)
      .optional(),
    address: z
      .preprocess((v) => (v === undefined ? null : v), stringOrNullSchema)
      .optional(),
    lat: floatSchema.optional(),
    lng: floatSchema.optional(),
    featured: z.preprocess((v) => Boolean(v), z.boolean()).optional(),
    images: stringArraySchema.optional(),
    features: stringArraySchema.optional(),
    projectDetails: z.array(projectDetailSchema).optional(),
    brochureKey: z
      .preprocess((v) => {
        if (v == null) return null;
        if (typeof v === "string") return v.trim() || null;
        return null;
      }, z.string().nullable())
      .optional(),
  })
  .strict();

function parseBody(body: unknown): NewProperty {
  const parsed = createBodySchema.parse(body);
  const projectDetails: ProjectDetail[] = (parsed.projectDetails ?? []).map(
    (x) => ({ label: x.label, value: x.value }),
  );

  const title = parsed.title;
  const slug = parsed.slug ?? slugify(title);

  const price = parsed.price?.trim() || "0";
  const area = parsed.area?.trim() || "0";
  const yearBuilt = parsed.yearBuilt?.trim();
  const bedrooms =
    parsed.bedrooms != null && parsed.bedrooms >= 0 ? parsed.bedrooms : 0;
  const bathrooms =
    parsed.bathrooms != null && parsed.bathrooms >= 0 ? parsed.bathrooms : 0;

  return {
    title,
    slug,
    description: parsed.description ?? null,
    price,
    type: parsed.type ?? "apartment",
    status: parsed.status ?? "available",
    bedrooms,
    bathrooms,
    area,
    ...(yearBuilt ? { yearBuilt } : {}),
    location: parsed.location ?? null,
    address: parsed.address ?? null,
    ...(typeof parsed.lat === "number" ? { lat: parsed.lat } : {}),
    ...(typeof parsed.lng === "number" ? { lng: parsed.lng } : {}),
    featured: parsed.featured ?? false,
    images: parsed.images ?? [],
    features: parsed.features ?? [],
    projectDetails,
    brochureKey: parsed.brochureKey ?? null,
  };
}

export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const properties = await getAllProperties();
    return NextResponse.json(properties);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to list properties";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const data = parseBody(body);
    const property = await createProperty(data);
    return NextResponse.json(property);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: err.issues },
        { status: 400 },
      );
    }
    const message =
      err instanceof Error ? err.message : "Failed to create property";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
