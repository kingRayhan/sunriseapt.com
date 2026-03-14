import { notFound } from "next/navigation";
import { getPostById } from "@/drizzle/queries/blog";
import { BlogForm } from "@/components/dashboard/blog-form";

interface Props {
  params: { id: string };
}

export default async function EditBlogPage({ params }: Props) {
  const post = await getPostById(params.id);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <BlogForm post={post} />
    </div>
  );
}
