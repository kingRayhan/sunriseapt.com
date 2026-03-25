import Link from "next/link";
import { Calendar, ArrowLeft, User } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPostBySlug } from "@/drizzle/queries/blog";
import {
  DEFAULT_DESCRIPTION,
  getSiteUrl,
  truncateMetaDescription,
} from "@/lib/seo";
import { getCdnImageUrl } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostBySlug(id);
  if (!post) {
    return {
      title: "Post not found",
      robots: { index: false, follow: true },
    };
  }

  const path = `/blog/${post.slug}`;
  const description = truncateMetaDescription(
    post.excerpt ?? post.content,
    160,
    DEFAULT_DESCRIPTION,
  );
  const absoluteImage =
    getCdnImageUrl(post.imageKey ?? "") ?? `${getSiteUrl()}/full-logo.png`;

  const published = new Date(String(post.date)).toISOString();

  return {
    title: post.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title: post.title,
      description,
      publishedTime: published,
      ...(post.author ? { authors: [post.author] } : {}),
      images: [{ url: absoluteImage, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [absoluteImage],
    },
  };
}

export const revalidate = 60;

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPostBySlug(id);

  if (!post) {
    return (
      <div className="pt-32 text-center">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <Button asChild>
          <Link href="/blog">Back to Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-24">
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Link>
        </Button>
      </div>

      <article className="container mx-auto px-4 lg:px-8 pb-16 max-w-3xl">
        <div className="aspect-video rounded-lg overflow-hidden mb-8">
          {post.imageKey && getCdnImageUrl(post.imageKey) && (
            <img
              src={getCdnImageUrl(post.imageKey)!}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary">{post.category}</Badge>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="h-4 w-4" /> {post.author}
          </span>
        </div>

        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">
          {post.title}
        </h1>

        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          {post.content.split("\n\n").map((paragraph, i) => (
            <p
              key={i}
              className="mb-4"
              dangerouslySetInnerHTML={{
                __html: paragraph.replace(
                  /\*\*(.*?)\*\*/g,
                  '<strong class="text-foreground">$1</strong>',
                ),
              }}
            />
          ))}
        </div>
      </article>
    </div>
  );
}
