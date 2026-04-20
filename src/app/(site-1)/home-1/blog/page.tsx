import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPublishedPosts } from "@/drizzle/queries/blog";
import { getCdnImageUrl } from "@/lib/utils";
import { SITE_NAME } from "@/lib/seo";

const description =
  "News and insights from Sunriseapt — market updates, tips, and stories from our real estate team.";

export const metadata: Metadata = {
  title: "Blog",
  description,
  alternates: { canonical: "/blog" },
  openGraph: {
    url: "/blog",
    title: `Blog | ${SITE_NAME}`,
    description,
  },
  twitter: {
    title: `Blog | ${SITE_NAME}`,
    description,
  },
};

export const revalidate = 60;

export default async function BlogPage() {
  const blogPosts = await getPublishedPosts();
  return (
    <div className="pt-20">
      <div className="bg-primary text-primary-foreground py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Blog & News</h1>
          <p className="text-primary-foreground/70">
            Insights, tips, and market updates
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {blogPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300 h-full">
                <div className="aspect-video overflow-hidden">
                  {post.imageKey && getCdnImageUrl(post.imageKey) && (
                    <img
                      src={getCdnImageUrl(post.imageKey)!}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center text-sm font-medium text-primary">
                    Read More <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
