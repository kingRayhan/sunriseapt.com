import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import {
  deleteTeamMember,
  getTeamMemberById,
  updateTeamMember,
} from "@/drizzle/queries/team";
import type { NewTeamMember } from "@/drizzle/schema";
import { z } from "zod";

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
    name: z.preprocess(trimToUndefined, z.string().min(1).optional()),
    role: z.preprocess(trimToUndefined, z.string().min(1).optional()),
    bio: stringOrNullSchema,
    imageKey: stringOrNullSchema,
    sortOrder: intSchema,
  })
  .strict();

function parseBody(
  body: unknown,
): Partial<Omit<NewTeamMember, "id" | "createdAt">> {
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
    const member = await getTeamMemberById(id);
    if (!member)
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 },
      );
    return NextResponse.json(member);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to get team member";
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
    const member = await getTeamMemberById(id);
    if (!member)
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 },
      );
    const body = await request.json();
    const data = parseBody(body);
    const updated = await updateTeamMember(id, data);
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: err.issues },
        { status: 400 },
      );
    }
    const message =
      err instanceof Error ? err.message : "Failed to update team member";
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
    const member = await getTeamMemberById(id);
    if (!member)
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 },
      );
    await deleteTeamMember(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete team member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

