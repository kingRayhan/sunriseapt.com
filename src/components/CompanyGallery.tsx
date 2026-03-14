"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryImage } from "@/drizzle";
import { getCdnBaseUrl, getCdnImageUrl } from "@/lib/utils";

function getSpanByIndex(index: number): string {
  if (index === 0) return "md:col-span-2 md:row-span-2";
  if (index === 5) return "md:col-span-2";
  return "";
}

interface CompanyGalleryProps {
  images: GalleryImage[];
}

export default function CompanyGallery({ images }: CompanyGalleryProps) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(!!images.length);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
              Promise.reject(new Error(d.error ?? "Failed to get URLs"))
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
      .catch(() => setUrls({}))
      .finally(() => setLoading(false));
  }, [images]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goPrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex(
      (lightboxIndex - 1 + images.length) % images.length
    );
  };

  const goNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % images.length);
  };

  if (images.length === 0 && !loading) return null;

  return (
    <>
      <section className="py-16 lg:py-24 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
              Gallery
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A glimpse into our projects, spaces, and the quality we deliver
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[220px]">
              {images.map((_, index) => (
                <div
                  key={images[index].id}
                  className={`animate-pulse rounded-lg bg-muted ${getSpanByIndex(index)}`}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[220px]">
              {images.map((image, index) => {
                const src = urls[image.imageKey];
                if (!src) return null;
                return (
                  <button
                    key={image.id}
                    onClick={() => openLightbox(index)}
                    className={`group relative rounded-lg overflow-hidden ${getSpanByIndex(index)}`}
                  >
                    <img
                      src={src}
                      alt={image.altText ?? "Gallery image"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && images[lightboxIndex] && urls[images[lightboxIndex].imageKey] && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <img
            src={urls[images[lightboxIndex].imageKey]}
            alt={images[lightboxIndex].altText ?? "Gallery image"}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-4 text-white/60 text-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
