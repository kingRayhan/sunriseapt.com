import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/site-2/PageHero";
import Markdown from "@/components/shared/Markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPostBySlug } from "@/drizzle/queries/blog";
import { getCdnImageUrl } from "@/lib/utils";
import { SITE_NAME } from "@/lib/seo";
import { ArrowLeft, Calendar, User } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostBySlug(id);
  if (!post) return { title: `Post | ${SITE_NAME}`, robots: { index: false } };

  const img = post.imageKey ? getCdnImageUrl(post.imageKey) : null;
  return {
    title: post.title,
    description: post.excerpt ?? `Blog post by ${SITE_NAME}.`,
    openGraph: img ? { images: [{ url: img, alt: post.title }] } : undefined,
  };
}

export const revalidate = 60;

export default async function Site2BlogPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPostBySlug(id);
  if (!post) notFound();

  const heroImg =
    (post.imageKey ? getCdnImageUrl(post.imageKey) : null) ??
    "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&q=80&w=2400";

  return (
    <main>
      <PageHero
        title="Blog"
        backgroundImage={heroImg}
        imageAlt={post.title}
        minHeightClassName="min-h-[min(45vh,520px)]"
      />

      <section className="border-t border-border/60 bg-background py-10 lg:py-14">
        <div className="container mx-auto px-4 lg:px-8">
          <Button
            variant="outline"
            className="border-foreground/25 bg-transparent"
            asChild
          >
            <Link href="/home-2/blog">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
              Back to blog
            </Link>
          </Button>
        </div>
      </section>

      <article className="border-t border-border/60 bg-background py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Post
            </p>
            <h1 className="text-balance text-3xl font-bold uppercase tracking-tight text-primary sm:text-4xl">
              {post.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {post.category ? (
                <Badge variant="secondary">{post.category}</Badge>
              ) : null}
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4" aria-hidden />
                {formatDate(post.date)}
              </span>
              {post.author ? (
                <span className="inline-flex items-center gap-2">
                  <User className="h-4 w-4" aria-hidden />
                  {post.author}
                </span>
              ) : null}
            </div>

            {post.excerpt ? (
              <p className="mt-8 text-pretty text-muted-foreground">
                {post.excerpt}
              </p>
            ) : null}

            {post.content ? (
              <Markdown
                content={post.content}
                className="mt-10 text-muted-foreground"
              />
            ) : (
              <p className="mt-10 text-sm text-muted-foreground">
                No content provided.
              </p>
            )}
          </div>
        </div>
      </article>
    </main>
  );
}

