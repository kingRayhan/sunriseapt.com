"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { TESTIMONIALS, type Testimonial } from "@/data/testimonials";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";

function getYouTubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  const watchMatch = trimmed.match(
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
  );
  if (watchMatch) return watchMatch[1];
  const shortMatch = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const embedMatch = trimmed.match(
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  );
  if (embedMatch) return embedMatch[1];
  return null;
}

function TestimonialMedia({
  item,
  onPlay,
}: {
  item: Testimonial;
  onPlay: () => void;
}) {
  return (
    <div className="relative aspect-4/5 w-full overflow-hidden rounded-lg border border-border/80 bg-muted shadow-sm sm:aspect-[5/6]">
      <img
        src={item.posterUrl}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.35)_45%,transparent_72%)]"
        aria-hidden
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
        <button
          type="button"
          onClick={onPlay}
          className="flex size-16 items-center justify-center rounded-full bg-white text-primary shadow-lg transition-opacity duration-200 ease-out hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50 motion-reduce:transition-none"
          aria-label={`Play video testimonial from ${item.authorName}`}
        >
          <Play className="ml-1 size-7 fill-current" aria-hidden />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 p-5 text-white sm:p-6">
        {item.overlayLine ? (
          <p className="text-pretty text-sm font-medium leading-snug text-white/95">
            {item.overlayLine}
          </p>
        ) : null}
        <div className="flex items-end justify-between gap-3 border-t border-white/25 pt-3">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/85 sm:text-xs">
            Apartment owner
          </span>
          <span className="max-w-[55%] text-right text-xs font-bold uppercase tracking-wide text-white sm:text-sm">
            {item.projectBrand}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const headingId = useId();
  const [index, setIndex] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const len = TESTIMONIALS.length;
  const current = TESTIMONIALS[index] ?? TESTIMONIALS[0];
  const youtubeId = getYouTubeVideoId(current.videoUrl);
  const embedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`
    : "";

  useEffect(() => {
    setVideoOpen(false);
  }, [index]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + len) % len);
  }, [len]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % len);
  }, [len]);

  if (len === 0) return null;

  return (
    <section
      id="testimonials"
      className="border-t border-border/60 bg-background py-16 lg:py-24"
      aria-labelledby={headingId}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Testimonial
        </p>
        <h2
          id={headingId}
          className="mb-12 max-w-4xl text-balance text-3xl font-bold uppercase leading-[1.12] tracking-tight text-primary sm:mb-14 sm:text-4xl lg:mb-16 lg:text-5xl"
        >
          What customers say about us
        </h2>

        <p className="sr-only" aria-live="polite">
          {current.title}. {current.authorName}, {current.authorTitle}.
        </p>

        <div
          className="grid items-start gap-12 lg:grid-cols-[minmax(0,2.35fr)_minmax(0,4.45fr)] lg:gap-14 xl:gap-16"
          role="region"
          aria-roledescription="carousel"
          aria-label="Customer testimonials"
        >
          <div className="min-w-0">
            <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
              <TestimonialMedia
                item={current}
                onPlay={() => setVideoOpen(true)}
              />

              <DialogContent className="w-[calc(100%-2rem)] max-w-4xl gap-0 overflow-hidden border-0 p-0 sm:rounded-lg">
                <DialogTitle className="sr-only">
                  Video: {current.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Testimonial video featuring {current.authorName}.
                </DialogDescription>
                <div className="aspect-video bg-black">
                  {embedUrl ? (
                    <iframe
                      title={`Testimonial video: ${current.title}`}
                      src={videoOpen ? embedUrl : undefined}
                      className="size-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-3 p-8 text-center text-white">
                      <p className="text-pretty text-sm text-white/90">
                        Add a valid YouTube URL to this testimonial to play video
                        here.
                      </p>
                      <Button variant="secondary" asChild>
                        <Link href="/contact">Contact us</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div
            className="group/testimonial relative flex min-h-[280px] min-w-0 flex-col rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 lg:min-h-0"
            tabIndex={0}
            aria-label="Testimonial quote; focus here to reveal the full story."
          >
            <span
              className="pointer-events-none absolute -left-1 -top-6 font-serif text-[5.5rem] leading-none text-muted-foreground/15 sm:text-[6.5rem]"
              aria-hidden
            >
              &ldquo;
            </span>

            <div
              key={current.id}
              className="relative animate-in fade-in-0 duration-200 motion-reduce:animate-none"
            >
              <div className="relative pt-4 sm:pt-6">
                <div className="space-y-0">
                  <h3 className="text-balance text-2xl font-bold text-primary sm:text-3xl lg:text-[2rem]">
                    {current.title}
                  </h3>
                  <p
                    className={cn(
                      "text-pretty pt-3 text-sm leading-relaxed text-muted-foreground sm:text-base",
                      "max-h-0 translate-y-1 overflow-hidden opacity-0",
                      "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
                      "group-hover/testimonial:max-h-80 group-hover/testimonial:translate-y-0 group-hover/testimonial:opacity-100",
                      "group-focus-within/testimonial:max-h-80 group-focus-within/testimonial:translate-y-0 group-focus-within/testimonial:opacity-100",
                    )}
                  >
                    {current.shortDescription}
                  </p>
                </div>

                <div className="mt-10 border-t border-border/60 pt-8 sm:mt-12">
                  <p className="text-lg font-semibold text-foreground">
                    {current.authorName}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {current.authorTitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-4 sm:mt-12">
              <button
                type="button"
                onClick={goPrev}
                className="inline-flex size-11 items-center justify-center rounded-full border border-foreground/25 text-foreground transition-opacity duration-200 hover:bg-muted/60 hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="inline-flex size-11 items-center justify-center rounded-full border border-foreground/25 text-foreground transition-opacity duration-200 hover:bg-muted/60 hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                aria-label="Next testimonial"
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
