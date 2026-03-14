import Link from "next/link";
import { getAllPosts } from "@/drizzle/queries/blog";
import { BlogTable } from "@/components/dashboard/blog-table";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export const revalidate = 60;

export default async function DashboardBlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">Manage blog posts</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/blog/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Post
          </Link>
        </Button>
      </div>
      <BlogTable posts={posts} />
    </div>
  );
}
