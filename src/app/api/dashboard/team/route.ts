import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { createTeamMember, getTeamMembers } from "@/drizzle/queries/team";
import type { NewTeamMember } from "@/drizzle/schema";
import { z } from "zod";

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
    name: z.preprocess(trimToUndefined, z.string().min(1)),
    role: z.preprocess(trimToUndefined, z.string().min(1)),
    bio: z.preprocess((v) => (v === undefined ? null : v), stringOrNullSchema),
    imageKey: z.preprocess(
      (v) => (v === undefined ? null : v),
      stringOrNullSchema,
    ),
    sortOrder: intSchema.optional(),
  })
  .strict();

function parseBody(body: unknown): NewTeamMember {
  const parsed = createBodySchema.parse(body);
  return {
    name: parsed.name,
    role: parsed.role,
    bio: parsed.bio ?? null,
    imageKey: parsed.imageKey ?? null,
    sortOrder: parsed.sortOrder ?? 0,
  };
}

export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const members = await getTeamMembers();
    return NextResponse.json(members);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to list team members";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const data = parseBody(body);
    const member = await createTeamMember(data);
    return NextResponse.json(member);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: err.issues },
        { status: 400 },
      );
    }
    const message =
      err instanceof Error ? err.message : "Failed to create team member";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

