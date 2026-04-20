"use client";

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
  "https://images.unsplash.com/photo-1600566753190-17f0bdf2cb6a?auto=format&fit=crop&q=80&w=2000";

export default function ShowcaseVideoSection() {
  const [open, setOpen] = useState(false);
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
      id="showcase"
      className="relative overflow-hidden border-t border-border/60 py-16 lg:py-24"
      aria-label="Featured showcase video"
    >
      <div className="absolute inset-0 bg-background" aria-hidden />

      <div
        className="absolute inset-0 bg-[url('/images/background.svg')] bg-cover bg-center bg-no-repeat opacity-[0.5] motion-reduce:opacity-[0.42]"
        aria-hidden
      />

      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        <Dialog open={open} onOpenChange={setOpen}>
          <div className="mx-auto w-full max-w-2xl lg:max-w-3xl">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/70 shadow-md">
              {useFallbackImage ? (
                <Image
                  src={FALLBACK_POSTER}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 768px"
                  priority={false}
                />
              ) : (
                <img
                  src={rasterPoster ?? FALLBACK_POSTER}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              )}

              <div className="absolute inset-0 bg-black/30" aria-hidden />

              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="flex size-16 items-center justify-center rounded-full bg-[#E50914] text-white shadow-lg transition-opacity duration-200 ease-out hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 motion-reduce:transition-none"
                  aria-label={
                    youtubeId
                      ? "Play showcase video"
                      : "Open video (configure link in environment)"
                  }
                >
                  <Play className="ml-1 size-8 fill-white" aria-hidden />
                </button>
              </div>
            </div>
          </div>

          <DialogContent className="w-[calc(100%-2rem)] max-w-4xl gap-0 overflow-hidden border-0 p-0 sm:rounded-lg">
            <DialogTitle className="sr-only">Showcase video</DialogTitle>
            <DialogDescription className="sr-only">
              Promotional video about our developments.
            </DialogDescription>
            <div className="aspect-video bg-black">
              {embedUrl ? (
                <iframe
                  title="Showcase video"
                  src={open ? embedUrl : undefined}
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
    </section>
  );
}
