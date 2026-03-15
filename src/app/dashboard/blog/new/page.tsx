"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2Icon } from "lucide-react";

export default function NewBlogPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function createAndRedirect() {
      try {
        const res = await fetch("/api/dashboard/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "New Post",
            slug: `new-post-${Date.now()}`,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            (data as { error?: string }).error ?? "Failed to create post",
          );
        }
        const post = (await res.json()) as { id: string };
        if (!cancelled && post?.id) {
          router.replace(`/dashboard/blog/${post.id}/edit`);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to create post",
          );
        }
      }
    }

    createAndRedirect();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-sm text-destructive">{error}</p>
        <button
          type="button"
          className="text-sm text-primary underline underline-offset-4"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Creating new post…</p>
    </div>
  );
}
