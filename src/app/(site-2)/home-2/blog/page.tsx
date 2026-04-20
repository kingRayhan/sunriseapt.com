import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/site-2/PageHero";
import { Button } from "@/components/ui/button";
import { getPublishedPosts } from "@/drizzle/queries/blog";
import { getCdnImageUrl } from "@/lib/utils";
import { SITE_NAME } from "@/lib/seo";
import { ArrowRight, Calendar } from "lucide-react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&q=80&w=2400";

export const metadata: Metadata = {
  title: "Blog",
  description: `News, updates, and stories from ${SITE_NAME}.`,
};

export const revalidate = 60;

function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function Site2BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <main>
      <PageHero
        title="Blog"
        backgroundImage={HERO_IMAGE}
        imageAlt="City buildings"
        minHeightClassName="min-h-[min(52vh,560px)]"
      />

      <section
        className="border-t border-border/60 bg-background py-16 lg:py-24"
        aria-labelledby="blog-heading"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-10 flex flex-col gap-3 lg:mb-12">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Updates
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2
                id="blog-heading"
                className="text-balance text-3xl font-bold uppercase tracking-tight text-primary sm:text-4xl"
              >
                Latest posts
              </h2>
              <p className="text-sm text-muted-foreground">
                {posts.length} post{posts.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-lg border border-border/60 bg-muted/20 p-10 text-center">
              <p className="text-sm text-muted-foreground">
                No posts published yet.
              </p>
              <Button
                variant="outline"
                className="mt-4 border-primary bg-transparent hover:bg-primary/10"
                asChild
              >
                <Link href="/home-2/contact">
                  Contact us
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const img = post.imageKey ? getCdnImageUrl(post.imageKey) : null;
                return (
                  <Link
                    key={post.id}
                    href={`/home-2/blog/${post.slug}`}
                    className="group overflow-hidden rounded-sm border border-border/60 bg-muted transition-colors hover:bg-muted/60"
                  >
                    <div className="relative aspect-video bg-muted">
                      {img ? (
                        <img
                          src={img}
                          alt={post.title}
                          className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-muted" aria-hidden />
                      )}
                      <div
                        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.78)_0%,transparent_65%)]"
                        aria-hidden
                      />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                        <p className="line-clamp-2 text-sm font-bold uppercase tracking-wide">
                          {post.title}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 p-4">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="h-4 w-4" aria-hidden />
                          {formatDate(post.date)}
                        </span>
                        {post.category ? (
                          <span className="rounded-full bg-background px-2 py-0.5">
                            {post.category}
                          </span>
                        ) : null}
                      </div>
                      {post.excerpt ? (
                        <p className="line-clamp-3 text-sm text-muted-foreground">
                          {post.excerpt}
                        </p>
                      ) : null}

                      <span className="inline-flex items-center text-sm font-medium text-foreground hover:opacity-80">
                        Read more
                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

