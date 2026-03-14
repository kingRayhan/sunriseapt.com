import { NextResponse } from "next/server";
import {
  getPropertyById,
  updateProperty,
  deleteProperty,
} from "@/drizzle/queries/properties";
import type { NewProperty } from "@/drizzle/schema";
import type { ProjectDetail } from "@/drizzle/schema";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseBody(body: unknown): Partial<NewProperty> {
  const o = body as Record<string, unknown>;
  const out: Partial<NewProperty> = {};

  if (typeof o?.title === "string" && o.title.trim())
    out.title = o.title.trim();
  if (typeof o?.slug === "string" && o.slug.trim()) out.slug = o.slug.trim();
  else if (typeof o?.title === "string" && o.title.trim())
    out.slug = slugify(o.title.trim());

  if (o?.description !== undefined)
    out.description =
      typeof o.description === "string" ? o.description.trim() || null : null;
  if (o?.price !== undefined)
    out.price =
      typeof o.price === "number"
        ? String(o.price)
        : typeof o.price === "string"
          ? o.price.trim() || "0"
          : "0";
  if (typeof o?.type === "string" && o.type.trim()) out.type = o.type.trim();
  if (typeof o?.status === "string" && o.status.trim())
    out.status = o.status.trim();
  if (o?.bedrooms !== undefined)
    out.bedrooms =
      typeof o.bedrooms === "number"
        ? o.bedrooms
        : parseInt(String(o.bedrooms), 10) || 0;
  if (o?.bathrooms !== undefined)
    out.bathrooms =
      typeof o.bathrooms === "number"
        ? o.bathrooms
        : parseInt(String(o.bathrooms), 10) || 0;
  if (o?.area !== undefined)
    out.area =
      typeof o.area === "number"
        ? String(o.area)
        : typeof o.area === "string"
          ? o.area.trim() || "0"
          : "0";
  if (o?.yearBuilt !== undefined && o?.yearBuilt !== "")
    out.yearBuilt =
      typeof o.yearBuilt === "number"
        ? o.yearBuilt
        : parseInt(String(o.yearBuilt), 10);
  if (o?.location !== undefined)
    out.location =
      typeof o.location === "string" ? o.location.trim() || null : null;
  if (o?.address !== undefined)
    out.address =
      typeof o.address === "string" ? o.address.trim() || null : null;
  if (o?.lat !== undefined && o?.lat !== "")
    out.lat =
      typeof o.lat === "number" ? o.lat : parseFloat(String(o.lat));
  if (o?.lng !== undefined && o?.lng !== "")
    out.lng =
      typeof o.lng === "number" ? o.lng : parseFloat(String(o.lng));
  if (o?.featured !== undefined) out.featured = Boolean(o.featured);

  if (o?.images !== undefined) {
    out.images = Array.isArray(o.images)
      ? (o.images as string[]).filter((x) => typeof x === "string")
      : typeof o.images === "string" && o.images.trim()
        ? o.images.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
  }
  if (o?.features !== undefined) {
    out.features = Array.isArray(o.features)
      ? (o.features as string[]).filter((x) => typeof x === "string")
      : typeof o.features === "string" && o.features.trim()
        ? o.features.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
  }
  if (o?.projectDetails !== undefined && Array.isArray(o.projectDetails)) {
    out.projectDetails = (o.projectDetails as unknown[]).filter(
      (x): x is ProjectDetail =>
        x != null &&
        typeof x === "object" &&
        typeof (x as ProjectDetail).label === "string" &&
        typeof (x as ProjectDetail).value === "string"
    ) as ProjectDetail[];
  }
  if (o?.brochureKey !== undefined)
    out.brochureKey =
      typeof o.brochureKey === "string" && o.brochureKey.trim()
        ? o.brochureKey.trim()
        : null;

  return out;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const property = await getPropertyById(params.id);
    if (!property)
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    return NextResponse.json(property);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to get property";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const property = await getPropertyById(params.id);
    if (!property)
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    const body = await request.json();
    const data = parseBody(body);
    const updated = await updateProperty(params.id, data);
    return NextResponse.json(updated);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update property";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const property = await getPropertyById(params.id);
    if (!property)
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    await deleteProperty(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete property";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
