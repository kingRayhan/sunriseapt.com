import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import {
  getPostById,
  updatePost,
  deletePost,
} from "@/drizzle/queries/blog";
import type { NewBlogPost } from "@/drizzle/schema";
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

const stringOrNullSchema = z.preprocess(
  (v) => {
    if (v === undefined) return undefined; // PATCH semantics
    if (v == null) return null;
    if (typeof v === "string") return v.trim() || null;
    return null;
  },
  z.string().nullable().optional(),
);

const dateIsoSchema = z.preprocess(
  (v) => {
    if (v === undefined || v === "") return undefined;
    if (v instanceof Date) return v;
    if (typeof v === "string") return new Date(v);
    return undefined;
  },
  z
    .date()
    .optional()
    .transform((d) => (d ? d.toISOString().slice(0, 10) : undefined)),
);

const patchBodySchema = z
  .object({
    title: z.preprocess(trimToUndefined, z.string().min(1).optional()),
    slug: z.preprocess(trimToUndefined, z.string().min(1).optional()),
    excerpt: stringOrNullSchema,
    content: stringOrNullSchema,
    date: dateIsoSchema.optional(),
    imageKey: stringOrNullSchema,
    published: z.preprocess(
      (v) => (v === undefined ? undefined : Boolean(v)),
      z.boolean().optional(),
    ),
  })
  .strict();

function parseBody(
  body: unknown,
): Partial<Omit<NewBlogPost, "id" | "createdAt">> {
  const parsed = patchBodySchema.parse(body);
  const out: Partial<Omit<NewBlogPost, "id" | "createdAt">> = {
    ...parsed,
  };
  if (out.title && !out.slug) out.slug = slugify(out.title);
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
    const post = await getPostById(id);
    if (!post)
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to get post";
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
    const post = await getPostById(id);
    if (!post)
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    const body = await request.json();
    const data = parseBody(body);
    const updated = await updatePost(id, data);
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: err.issues },
        { status: 400 },
      );
    }
    const message =
      err instanceof Error ? err.message : "Failed to update post";
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
    const post = await getPostById(id);
    if (!post)
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    await deletePost(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
