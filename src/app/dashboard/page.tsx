import Link from "next/link";
import {
  Building2Icon,
  FileTextIcon,
  ClipboardListIcon,
  CameraIcon,
  ArrowRightIcon,
  MailIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllProperties } from "@/drizzle/queries/properties";
import { getAllPosts } from "@/drizzle/queries/blog";
import { getAllInquiries } from "@/drizzle/queries/contact";
import { getGalleryImages } from "@/drizzle/queries/gallery";

export const revalidate = 60;

async function getDashboardMetrics() {
  const [properties, posts, inquiries, galleryImages] = await Promise.all([
    getAllProperties(),
    getAllPosts(),
    getAllInquiries(),
    getGalleryImages(),
  ]);

  const newInquiries = inquiries.filter((i) => i.status === "new");
  const publishedPosts = posts.filter((p) => p.published);

  return {
    properties: properties.length,
    posts: posts.length,
    publishedPosts: publishedPosts.length,
    inquiries: inquiries.length,
    newInquiries: newInquiries.length,
    galleryImages: galleryImages.length,
    recentInquiries: inquiries.slice(0, 5),
  };
}

function formatDate(d: Date | string): string {
  if (typeof d === "string") return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  const statCards = [
    {
      title: "Properties",
      value: metrics.properties,
      description: "Total listings",
      icon: Building2Icon,
      href: "/dashboard/properties",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Blog posts",
      value: metrics.posts,
      description: `${metrics.publishedPosts} published`,
      icon: FileTextIcon,
      href: "/dashboard/blog",
      color: "text-foreground",
      bgColor: "bg-muted",
    },
    {
      title: "Inquiries",
      value: metrics.inquiries,
      description: metrics.newInquiries > 0 ? `${metrics.newInquiries} new` : "All caught up",
      icon: ClipboardListIcon,
      href: "/dashboard/inquiries",
      color: "text-foreground",
      bgColor: "bg-muted",
    },
    {
      title: "Gallery images",
      value: metrics.galleryImages,
      description: "On homepage",
      icon: CameraIcon,
      href: "/dashboard/gallery",
      color: "text-foreground",
      bgColor: "bg-muted",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your property hub
        </p>
      </div>

      {/* Metrics grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.href} href={stat.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-md p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent inquiries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent inquiries</CardTitle>
            <CardDescription>Latest contact form submissions</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/inquiries">
              View all
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {metrics.recentInquiries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No inquiries yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {metrics.recentInquiries.map((inq) => (
                <li
                  key={inq.id}
                  className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex gap-3 min-w-0">
                    <div className="rounded-full bg-muted p-2 shrink-0">
                      <MailIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{inq.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {inq.email}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {inq.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant={inq.status === "new" ? "default" : "secondary"} className="capitalize">
                      {inq.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(inq.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
