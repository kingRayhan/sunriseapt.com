"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2Icon, Trash2Icon, UploadIcon } from "lucide-react";
import type { GalleryImage } from "@/drizzle";
import { getCdnBaseUrl, getCdnImageUrl } from "@/lib/utils";

interface GalleryGridProps {
  images: GalleryImage[];
}

export function GalleryGrid({ images }: GalleryGridProps) {
  const router = useRouter();
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (images.length === 0) {
      setLoading(false);
      return;
    }
    if (getCdnBaseUrl()) {
      const byKey: Record<string, string> = {};
      images.forEach((img) => {
        const url = getCdnImageUrl(img.imageKey);
        if (url) byKey[img.imageKey] = url;
      });
      setUrls(byKey);
      setLoading(false);
      return;
    }
    const keys = images.map((img) => img.imageKey);
    fetch("/api/storage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keys, operation: "get" }),
    })
      .then((res) => {
        if (!res.ok)
          return res
            .json()
            .then((d) =>
              Promise.reject(new Error(d.error ?? "Failed to get URLs")),
            );
        return res.json();
      })
      .then((data: { urls?: string[]; url?: string }) => {
        const list = data.urls ?? (data.url ? [data.url] : []);
        const byKey: Record<string, string> = {};
        keys.forEach((key, i) => {
          if (list[i]) byKey[key] = list[i];
        });
        setUrls(byKey);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load images"),
      )
      .finally(() => setLoading(false));
  }, [images]);

  const uploadFiles = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setUploadError(null);
      setUploading(true);
      setUploadProgress({ current: 0, total: acceptedFiles.length });
      try {
        for (let i = 0; i < acceptedFiles.length; i++) {
          setUploadProgress({ current: i + 1, total: acceptedFiles.length });
          const file = acceptedFiles[i];
          const formData = new FormData();
          formData.append("file", file);
          const uploadRes = await fetch("/api/storage/upload", {
            method: "POST",
            body: formData,
          });
          if (!uploadRes.ok) {
            const d = await uploadRes.json();
            throw new Error(d.error ?? "Upload failed");
          }
          const { key } = await uploadRes.json();
          const createRes = await fetch("/api/gallery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageKey: key }),
          });
          if (!createRes.ok) {
            const d = await createRes.json();
            throw new Error(d.error ?? "Failed to save gallery record");
          }
        }
        setUploadProgress(null);
        router.refresh();
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
        setUploadProgress(null);
      } finally {
        setUploading(false);
      }
    },
    [router],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: true,
    disabled: uploading,
    onDropAccepted: uploadFiles,
    onDropRejected: (fileRejections) => {
      const msg = fileRejections
        .flatMap((r) => r.errors.map((e) => e.message))
        .join("; ");
      setUploadError(msg || "Invalid file(s). Only images are allowed.");
    },
  });

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to delete");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload dropzone */}
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`
              min-h-[160px] rounded-lg border-2 border-dashed p-6 text-center
              transition-colors cursor-pointer
              hover:border-primary/50 hover:bg-muted/30
              ${isDragActive ? "border-primary bg-muted/50" : "border-muted-foreground/25"}
              ${uploading ? "pointer-events-none opacity-70" : ""}
            `}
          >
            <input {...getInputProps()} />
            {uploading && uploadProgress ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2Icon className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium">
                  Uploading {uploadProgress.current} of {uploadProgress.total}…
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <UploadIcon className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {isDragActive
                    ? "Drop images here…"
                    : "Drag & drop images here, or click to select"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Multiple files supported. Images only.
                </p>
              </div>
            )}
          </div>
          {uploadError && (
            <p className="mt-3 text-sm text-destructive">{uploadError}</p>
          )}
        </CardContent>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <Card
              key={img.id}
              className="aspect-square animate-pulse bg-muted"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <Card key={img.id} className="overflow-hidden group">
              <CardContent className="relative p-0 aspect-square">
                {urls[img.imageKey] ? (
                  <img
                    src={urls[img.imageKey]}
                    alt={img.altText ?? "Gallery image"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">
                    No preview
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        disabled={deletingId === img.id}
                      >
                        {deletingId === img.id ? (
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2Icon className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete image?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the image from the gallery and from
                          storage. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(img.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
