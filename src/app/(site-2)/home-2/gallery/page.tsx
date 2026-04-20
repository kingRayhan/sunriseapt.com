import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/site-2/PageHero";
import { Button } from "@/components/ui/button";
import { getGalleryImages } from "@/drizzle/queries/gallery";
import { getCdnBaseUrl, getCdnImageUrl } from "@/lib/utils";
import { SITE_NAME } from "@/lib/seo";
import { ArrowRight } from "lucide-react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&q=80&w=2400";

export const metadata: Metadata = {
  title: "Gallery",
  description: `A look at our work — ${SITE_NAME} gallery.`,
};

export const revalidate = 60;

export default async function Site2GalleryPage() {
  const rows = await getGalleryImages();
  const cdnEnabled = Boolean(getCdnBaseUrl());

  const images = rows
    .map((img) => {
      const url = getCdnImageUrl(img.imageKey);
      return url ? { id: img.id, url, alt: img.altText ?? "Gallery image" } : null;
    })
    .filter((x): x is { id: string; url: string; alt: string } => x != null);

  // If CDN isn't set, we cannot resolve public URLs reliably.
  if (!cdnEnabled) {
    return (
      <main>
        <PageHero
          title="Gallery"
          backgroundImage={HERO_IMAGE}
          imageAlt="Residential interior"
          minHeightClassName="min-h-[min(52vh,560px)]"
        />
        <section className="border-t border-border/60 bg-background py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-10 text-center">
              <p className="text-sm text-muted-foreground">
                Gallery is not configured yet.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Set <span className="font-mono">NEXT_PUBLIC_CDN_URL</span> to
                enable public gallery images.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <PageHero
        title="Gallery"
        backgroundImage={HERO_IMAGE}
        imageAlt="Residential interior"
        minHeightClassName="min-h-[min(52vh,560px)]"
      />

      <section
        className="border-t border-border/60 bg-background py-16 lg:py-24"
        aria-labelledby="gallery-heading"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-10 flex flex-col gap-3 lg:mb-12">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Showcase
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2
                id="gallery-heading"
                className="text-balance text-3xl font-bold uppercase tracking-tight text-primary sm:text-4xl"
              >
                Project moments
              </h2>
              <p className="text-sm text-muted-foreground">
                {images.length} photo{images.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {images.length === 0 ? (
            <div className="rounded-lg border border-border/60 bg-muted/20 p-10 text-center">
              <p className="text-sm text-muted-foreground">
                No gallery images yet.
              </p>
              <Button
                variant="outline"
                className="mt-4 border-primary bg-transparent hover:bg-primary/10"
                asChild
              >
                <Link href="/home-2/contact">
                  Contact us
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="mb-4 break-inside-avoid overflow-hidden rounded-sm border border-border/60 bg-muted"
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="h-auto w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

