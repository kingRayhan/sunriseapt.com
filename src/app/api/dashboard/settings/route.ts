import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getSiteSettings, upsertSiteSetting } from "@/drizzle/queries/settings";

export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const settings = await getSiteSettings();
    return NextResponse.json(settings);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Body must be an object of key-value pairs" },
        { status: 400 }
      );
    }
    for (const [key, value] of Object.entries(body)) {
      if (typeof key !== "string" || key.trim() === "") continue;
      const strValue =
        value === null || value === undefined
          ? ""
          : typeof value === "string"
            ? value
            : JSON.stringify(value);
      await upsertSiteSetting(key.trim(), strValue);
    }
    const settings = await getSiteSettings();
    return NextResponse.json(settings);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
