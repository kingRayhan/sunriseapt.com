import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getAllProperties, createProperty } from "@/drizzle/queries/properties";
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

function parseBody(body: unknown): Partial<NewProperty> & { title: string } {
  const o = body as Record<string, unknown>;
  const title = typeof o?.title === "string" ? o.title.trim() : "";
  if (!title) throw new Error("title is required");

  const slug =
    typeof o?.slug === "string" && o.slug.trim()
      ? o.slug.trim()
      : slugify(title);

  const price =
    typeof o?.price === "number"
      ? String(o.price)
      : typeof o?.price === "string"
        ? o.price.trim() || "0"
        : "0";
  const bedrooms =
    typeof o?.bedrooms === "number"
      ? o.bedrooms
      : typeof o?.bedrooms === "string"
        ? parseInt(o.bedrooms, 10) || 0
        : 0;
  const bathrooms =
    typeof o?.bathrooms === "number"
      ? o.bathrooms
      : typeof o?.bathrooms === "string"
        ? parseInt(o.bathrooms, 10) || 0
        : 0;
  const area =
    typeof o?.area === "number"
      ? String(o.area)
      : typeof o?.area === "string"
        ? o.area.trim() || "0"
        : "0";
  const yearBuilt =
    o?.yearBuilt != null && o?.yearBuilt !== ""
      ? typeof o.yearBuilt === "number"
        ? o.yearBuilt
        : parseInt(String(o.yearBuilt), 10)
      : undefined;
  const lat =
    o?.lat != null && o?.lat !== ""
      ? typeof o.lat === "number"
        ? o.lat
        : parseFloat(String(o.lat))
      : undefined;
  const lng =
    o?.lng != null && o?.lng !== ""
      ? typeof o.lng === "number"
        ? o.lng
        : parseFloat(String(o.lng))
      : undefined;

  let images: string[] = [];
  if (Array.isArray(o?.images)) {
    images = o.images.filter((x): x is string => typeof x === "string");
  } else if (typeof o?.images === "string" && o.images.trim()) {
    images = o.images
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  let features: string[] = [];
  if (Array.isArray(o?.features)) {
    features = o.features.filter((x): x is string => typeof x === "string");
  } else if (typeof o?.features === "string" && o.features.trim()) {
    features = o.features
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  let projectDetails: ProjectDetail[] = [];
  if (Array.isArray(o?.projectDetails)) {
    projectDetails = o.projectDetails.filter(
      (x): x is ProjectDetail =>
        x != null &&
        typeof x === "object" &&
        typeof (x as ProjectDetail).label === "string" &&
        typeof (x as ProjectDetail).value === "string",
    );
  }

  return {
    title,
    slug,
    description:
      typeof o?.description === "string" ? o.description.trim() || null : null,
    price: price === "" ? "0" : price,
    type:
      typeof o?.type === "string" && o.type.trim()
        ? o.type.trim()
        : "apartment",
    status:
      typeof o?.status === "string" && o.status.trim()
        ? o.status.trim()
        : "available",
    bedrooms: Number.isInteger(bedrooms) && bedrooms >= 0 ? bedrooms : 0,
    bathrooms: Number.isInteger(bathrooms) && bathrooms >= 0 ? bathrooms : 0,
    area: area === "" ? "0" : area,
    ...(Number.isInteger(yearBuilt) && yearBuilt > 0 ? { yearBuilt } : {}),
    location:
      typeof o?.location === "string" && o.location.trim()
        ? o.location.trim()
        : null,
    address:
      typeof o?.address === "string" && o.address.trim()
        ? o.address.trim()
        : null,
    ...(typeof lat === "number" && !Number.isNaN(lat) ? { lat } : {}),
    ...(typeof lng === "number" && !Number.isNaN(lng) ? { lng } : {}),
    featured: Boolean(o?.featured),
    images,
    features,
    projectDetails,
    brochureKey:
      typeof o?.brochureKey === "string" && o.brochureKey.trim()
        ? o.brochureKey.trim()
        : null,
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
    const data = parseBody(body) as NewProperty;
    const property = await createProperty(data);
    return NextResponse.json(property);
  } catch (err) {
    console.error(JSON.stringify(err, null, 2));
    const message =
      err instanceof Error ? err.message : "Failed to create property";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
