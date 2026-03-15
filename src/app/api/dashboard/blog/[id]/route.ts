import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import {
  getPostById,
  updatePost,
  deletePost,
} from "@/drizzle/queries/blog";
import type { NewBlogPost } from "@/drizzle/schema";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseBody(body: unknown): Partial<Omit<NewBlogPost, "id" | "createdAt">> {
  const o = body as Record<string, unknown>;
  const out: Partial<Omit<NewBlogPost, "id" | "createdAt">> = {};

  if (typeof o?.title === "string" && o.title.trim()) out.title = o.title.trim();
  if (typeof o?.slug === "string" && o.slug.trim()) out.slug = o.slug.trim();
  else if (typeof o?.title === "string" && o.title.trim())
    out.slug = slugify(o.title.trim());

  if (o?.excerpt !== undefined)
    out.excerpt =
      typeof o.excerpt === "string" ? o.excerpt.trim() || null : null;
  if (o?.content !== undefined)
    out.content =
      typeof o.content === "string" ? o.content.trim() || null : null;
  if (o?.date !== undefined && o?.date !== "") {
    const d = typeof o.date === "string" ? new Date(o.date) : (o.date as Date);
    if (!Number.isNaN(d.getTime()))
      (out as { date?: string }).date = d.toISOString().slice(0, 10);
  }
  if (o?.imageKey !== undefined)
    out.imageKey =
      typeof o.imageKey === "string" && o.imageKey.trim()
        ? o.imageKey.trim()
        : null;
  if (o?.published !== undefined) out.published = Boolean(o.published);

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
