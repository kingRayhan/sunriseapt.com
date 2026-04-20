"use client";

import LogoLight from "@/components/shared/LogoLight";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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

const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1600566753190-17f0bdf2cb6a?auto=format&fit=crop&q=80&w=1600";

export default function AboutUsSection() {
  const [videoOpen, setVideoOpen] = useState(false);
  const videoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim() ?? "";
  const posterEnv = process.env.NEXT_PUBLIC_HERO_VIDEO_POSTER_URL?.trim();
  const youtubeId = videoUrl ? getYouTubeVideoId(videoUrl) : null;
  const youtubePoster = youtubeId
    ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
    : null;

  const useFallbackImage = !posterEnv && !youtubePoster;
  const rasterPoster = posterEnv ?? youtubePoster;

  const embedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`
    : "";

  return (
    <section
      id="about"
      className="border-t border-border/60 bg-background py-16 lg:py-24"
      aria-labelledby="about-heading"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-3 text-xs font-medium uppercase text-muted-foreground">
              About us
            </p>
            <h2
              id="about-heading"
              className="mb-6 text-balance text-3xl font-bold uppercase text-primary md:text-4xl lg:text-5xl"
            >
              Redefining your standard of living
            </h2>
            <div className="text-pretty space-y-4 text-muted-foreground">
              <p>
                Sunrise Apartments Ltd. has grown from a focused residential
                developer into a team known for thoughtful layouts, dependable
                delivery, and places people are proud to call home.
              </p>
              <p>
                We pair architectural clarity with sustainable choices so each
                project reflects both its neighborhood and the way families want
                to live today—from concept through handover and long after.
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-8 border-foreground/25 bg-transparent text-foreground hover:bg-muted/60"
              asChild
            >
              <Link href="/contact">Learn more</Link>
            </Button>
          </div>

          <div>
            <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border shadow-md">
                {useFallbackImage ? (
                  <Image
                    src={FALLBACK_POSTER}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <img
                    src={rasterPoster ?? FALLBACK_POSTER}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                  />
                )}

                <div className="absolute inset-0 bg-black/25" aria-hidden />

                <div className="pointer-events-none absolute right-2 top-2 z-10 origin-top-right scale-[0.42] sm:scale-[0.5] md:scale-[0.55]">
                  <LogoLight />
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
                  <p className="text-balance text-lg font-bold text-white drop-shadow-md md:text-xl lg:text-2xl">
                    A trusted name in premium residential development
                  </p>
                  <button
                    type="button"
                    onClick={() => setVideoOpen(true)}
                    className="animation-ping pointer-events-auto flex size-16 items-center justify-center rounded-full bg-[#E50914] text-white shadow-lg transition-opacity duration-200 ease-out hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40"
                    aria-label={
                      youtubeId
                        ? "Play video"
                        : "Open video (configure link in settings)"
                    }
                  >
                    <Play className="ml-1 size-8 fill-white" aria-hidden />
                  </button>
                </div>
              </div>

              <DialogContent className="w-[calc(100%-2rem)] max-w-4xl gap-0 overflow-hidden border-0 p-0 sm:rounded-lg">
                <DialogTitle className="sr-only">Company video</DialogTitle>
                <DialogDescription className="sr-only">
                  Promotional video about our developments and company.
                </DialogDescription>
                <div className="aspect-video bg-black">
                  {embedUrl ? (
                    <iframe
                      title="Company showcase video"
                      src={videoOpen ? embedUrl : undefined}
                      className="size-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : videoUrl ? (
                    <video
                      src={videoUrl}
                      controls
                      playsInline
                      className="size-full object-contain"
                    />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-3 p-8 text-center text-white">
                      <p className="text-pretty text-sm text-white/90">
                        Add{" "}
                        <span className="font-mono text-xs">
                          NEXT_PUBLIC_HERO_VIDEO_URL
                        </span>{" "}
                        with a YouTube or direct video URL to play here.
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
        </div>
      </div>
    </section>
  );
}
