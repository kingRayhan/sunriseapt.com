import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getSiteSettings, upsertSiteSetting } from "@/drizzle/queries/settings";
import { z } from "zod";

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
    const body = await request.json();

    const settingsPatchSchema = z.record(
      z
        .string()
        .min(1)
        .transform((s) => s.trim())
        .refine((s) => s.length > 0, "Key cannot be empty"),
      z.unknown(),
    );

    const parsed = settingsPatchSchema.parse(body);

    for (const [key, value] of Object.entries(parsed)) {
      const strValue =
        value === null || value === undefined
          ? ""
          : typeof value === "string"
            ? value
            : JSON.stringify(value);
      await upsertSiteSetting(key, strValue);
    }
    const settings = await getSiteSettings();
    return NextResponse.json(settings);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: err.issues },
        { status: 400 },
      );
    }
    const message =
      err instanceof Error ? err.message : "Failed to update settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
