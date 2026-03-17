import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getAllPosts, createPost } from "@/drizzle/queries/blog";
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

const stringOrNullSchema = z.preprocess((v) => {
  if (v == null) return null;
  if (typeof v === "string") return v.trim() || null;
  return null;
}, z.string().nullable());

const dateIsoSchema = z.preprocess(
  (v) => {
    if (v == null || v === "") return undefined;
    if (v instanceof Date) return v;
    if (typeof v === "string") return new Date(v);
    return undefined;
  },
  z
    .date()
    .optional()
    .transform((d) => (d ? d.toISOString().slice(0, 10) : undefined)),
);

const createBodySchema = z
  .object({
    title: z.preprocess(trimToUndefined, z.string().min(1)),
    slug: z.preprocess(trimToUndefined, z.string().min(1)).optional(),
    excerpt: z.preprocess(
      (v) => (v === undefined ? null : v),
      stringOrNullSchema,
    ),
    content: z.preprocess(
      (v) => (v === undefined ? null : v),
      stringOrNullSchema,
    ),
    date: dateIsoSchema.optional(),
    imageKey: z.preprocess(
      (v) => (v === undefined ? null : v),
      stringOrNullSchema,
    ),
    published: z.preprocess((v) => Boolean(v), z.boolean()).optional(),
  })
  .strict();

function parseBody(body: unknown): NewBlogPost {
  const parsed = createBodySchema.parse(body);
  const slug = parsed.slug ?? slugify(parsed.title);
  const dateValue = parsed.date ?? new Date().toISOString().slice(0, 10);
  return {
    title: parsed.title,
    slug,
    excerpt: parsed.excerpt ?? null,
    content: parsed.content ?? null,
    date: dateValue,
    imageKey: parsed.imageKey ?? null,
    published: parsed.published ?? false,
  };
}

export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const posts = await getAllPosts();
    return NextResponse.json(posts);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list posts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const data = parseBody(body);
    const post = await createPost(data);
    return NextResponse.json(post);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: err.issues },
        { status: 400 },
      );
    }
    const message =
      err instanceof Error ? err.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
