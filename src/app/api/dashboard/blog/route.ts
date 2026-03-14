import { NextResponse } from "next/server";
import { getAllPosts, createPost } from "@/drizzle/queries/blog";
import type { NewBlogPost } from "@/drizzle/schema";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseBody(body: unknown): NewBlogPost {
  const o = body as Record<string, unknown>;
  const title = typeof o?.title === "string" ? o.title.trim() : "";
  if (!title) throw new Error("title is required");

  const slug =
    typeof o?.slug === "string" && o.slug.trim()
      ? o.slug.trim()
      : slugify(title);

  const dateStr = typeof o?.date === "string" ? o.date.trim() : "";
  const date = dateStr ? new Date(dateStr) : new Date();
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
  const dateValue = date.toISOString().slice(0, 10);

  return {
    title,
    slug,
    excerpt:
      typeof o?.excerpt === "string" ? o.excerpt.trim() || null : null,
    content:
      typeof o?.content === "string" ? o.content.trim() || null : null,
    date: dateValue,
    imageKey:
      typeof o?.imageKey === "string" && o.imageKey.trim()
        ? o.imageKey.trim()
        : null,
    published: Boolean(o?.published),
  };
}

export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json(posts);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to list posts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = parseBody(body);
    const post = await createPost(data);
    return NextResponse.json(post);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
