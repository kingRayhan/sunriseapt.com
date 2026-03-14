"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ArrowLeftIcon,
  Loader2Icon,
  FileTextIcon,
  ImagePlusIcon,
  X,
} from "lucide-react";
import { getCdnImageUrl } from "@/lib/utils";
import { RichTextEditor } from "@/components/dashboard/rich-text-editor";
import type { BlogPost } from "@/drizzle";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const blogFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  imageKey: z.string().optional(),
  published: z.boolean().optional(),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

function getDefaultValues(post?: BlogPost | null): BlogFormValues {
  const d = post?.date as string | Date | undefined;
  const dateStr =
    typeof d === "string"
      ? d.slice(0, 10)
      : d instanceof Date
        ? d.toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);
  return {
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    date: dateStr,
    imageKey: post?.imageKey ?? "",
    published: post?.published ?? false,
  };
}

async function fetchSignedUrl(key: string): Promise<string> {
  const res = await fetch("/api/storage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keys: [key], operation: "get" }),
  });
  if (!res.ok) {
    const d = await res.json();
    throw new Error(d.error ?? "Failed to load image");
  }
  const data = await res.json();
  const list = data.urls ?? (data.url ? [data.url] : []);
  return list[0] ?? "";
}

interface BlogFormProps {
  post?: BlogPost | null;
}

export function BlogForm({ post }: BlogFormProps) {
  const router = useRouter();
  const isEdit = !!post;

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: getDefaultValues(post),
    mode: "onTouched",
  });

  const saveMutation = useMutation({
    mutationFn: async (values: BlogFormValues) => {
      const body = {
        title: values.title.trim(),
        slug: values.slug.trim() || slugify(values.title),
        excerpt: values.excerpt?.trim() || null,
        content: values.content?.trim() || null,
        date: values.date.trim() || new Date().toISOString().slice(0, 10),
        imageKey: values.imageKey?.trim() || null,
        published: values.published ?? false,
      };
      const url = isEdit
        ? `/api/dashboard/blog/${post.id}`
        : "/api/dashboard/blog";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to save");
      }
      return res.json();
    },
    onSuccess: () => {
      router.push("/dashboard/blog");
      router.refresh();
    },
  });

  const onSubmit = form.handleSubmit((values) => saveMutation.mutate(values));
  const saving = saveMutation.isPending;
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const imageKey = form.watch("imageKey");
  const hasCdn = imageKey ? !!getCdnImageUrl(imageKey) : false;
  const { data: signedUrl } = useQuery({
    queryKey: ["storage-url", imageKey],
    queryFn: () => fetchSignedUrl(imageKey!),
    enabled: !!imageKey && !hasCdn,
  });
  const imagePreviewUrl = imageKey
    ? hasCdn
      ? getCdnImageUrl(imageKey)
      : (signedUrl ?? "")
    : "";

  async function handleFeatureImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      setImageUploadError("Please select an image file.");
      return;
    }
    setImageUploadError(null);
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("prefix", "blog");
      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Upload failed");
      }
      const { key } = await res.json();
      form.setValue("imageKey", key);
    } catch (err) {
      setImageUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  }

  function syncSlugFromTitle() {
    const title = form.getValues("title");
    if (title) form.setValue("slug", slugify(title));
  }

  const inputClassName =
    "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <Form {...form}>
      <form
        id="blog-form"
        onSubmit={onSubmit}
        className="flex min-h-[calc(100vh-var(--header-height,5rem))] flex-col"
      >
        <div className="flex-1 space-y-8 pb-24">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button type="button" variant="ghost" size="icon" asChild>
                <Link href="/dashboard/blog">
                  <ArrowLeftIcon className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-2xl font-bold tracking-tight">
                {isEdit ? "Edit Post" : "New Post"}
              </h1>
            </div>
          </div>

          {saveMutation.isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {saveMutation.error instanceof Error
                ? saveMutation.error.message
                : "Something went wrong"}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileTextIcon className="h-5 w-5" />
                Post
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Title, slug, excerpt, content and metadata
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={saving}
                          onBlur={() => syncSlugFromTitle()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug *</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={saving} />
                      </FormControl>
                      <FormDescription>
                        URL path (e.g. my-first-post)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={saving}
                        placeholder="Short summary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="Write your post content…"
                        disabled={saving}
                        minHeight="280px"
                      />
                    </FormControl>
                    <FormDescription>
                      Use the toolbar for bold, italic, headings, lists, and
                      more.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feature image</FormLabel>
                    <div className="space-y-2">
                      {field.value ? (
                        <div className="relative inline-block">
                          <div className="aspect-video w-full max-w-md overflow-hidden rounded-md border bg-muted">
                            {imageUploading ? (
                              <div className="flex aspect-video max-w-md items-center justify-center">
                                <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
                              </div>
                            ) : imagePreviewUrl ? (
                              <img
                                src={imagePreviewUrl}
                                alt="Feature"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex aspect-video max-w-md items-center justify-center text-muted-foreground text-sm">
                                Loading…
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="absolute right-2 top-2 opacity-90 hover:opacity-100"
                            disabled={saving || imageUploading}
                            onClick={() => field.onChange("")}
                            aria-label="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="flex aspect-video max-w-md cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/50 transition-colors hover:bg-muted"
                          onClick={() => imageInputRef.current?.click()}
                          onKeyDown={(e) =>
                            e.key === "Enter" && imageInputRef.current?.click()
                          }
                          role="button"
                          tabIndex={0}
                          aria-label="Upload feature image"
                        >
                          <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={saving || imageUploading}
                            onChange={handleFeatureImageUpload}
                          />
                          {imageUploading ? (
                            <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              <ImagePlusIcon className="h-10 w-10 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Click to upload image
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      {imageUploadError && (
                        <p className="text-sm text-destructive">
                          {imageUploadError}
                        </p>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" disabled={saving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Published</FormLabel>
                    <FormControl>
                      <div className="flex h-10 items-center pt-2">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={saving}
                        />
                        <label className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Show on blog
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
          <div className="container flex justify-end gap-2 px-4 sm:px-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/blog")}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset(getDefaultValues(post))}
              disabled={saving}
            >
              Reset
            </Button>
            <Button type="submit" form="blog-form" disabled={saving}>
              {saving ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                "Update post"
              ) : (
                "Create post"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
