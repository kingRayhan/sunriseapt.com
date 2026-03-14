"use client";

import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { getCdnImageUrl } from "@/lib/utils";

async function fetchSignedUrls(keys: string[]): Promise<Record<string, string>> {
  if (keys.length === 0) return {};
  const res = await fetch("/api/storage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keys, operation: "get" }),
  });
  if (!res.ok) {
    const d = await res.json();
    throw new Error(d.error ?? "Failed to load previews");
  }
  const data = await res.json();
  const list = data.urls ?? (data.url ? [data.url] : []);
  const out: Record<string, string> = {};
  keys.forEach((key, i) => {
    if (list[i]) out[key] = list[i];
  });
  return out;
}

interface GalleryImagePreviewProps {
  keys: string[];
  onRemove?: (key: string) => void;
  disabled?: boolean;
}

export function GalleryImagePreview({
  keys,
  onRemove,
  disabled,
}: GalleryImagePreviewProps) {
  const hasCdn = keys.length > 0 && !!getCdnImageUrl(keys[0]);
  const { data: urlMap, isLoading } = useQuery({
    queryKey: ["storage-urls", keys],
    queryFn: () => fetchSignedUrls(keys),
    enabled: keys.length > 0 && !hasCdn,
  });

  if (keys.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {keys.map((key) => {
        const src = hasCdn ? getCdnImageUrl(key) : urlMap?.[key];
        return (
          <div
            key={key}
            className="relative group aspect-square w-20 shrink-0 overflow-hidden rounded-md border bg-muted"
          >
            {isLoading && !hasCdn ? (
              <div className="absolute inset-0 animate-pulse bg-muted" />
            ) : src ? (
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
                —
              </div>
            )}
            {onRemove && !disabled && (
              <button
                type="button"
                onClick={() => onRemove(key)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={`Remove ${key}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
