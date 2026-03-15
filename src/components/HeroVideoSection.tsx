"use client";

import { useRef, useState, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

/** Extract YouTube video ID from watch, embed, or short URLs. */
function getYouTubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const embedMatch = trimmed.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  return null;
}

export type HeroVideoSectionProps = {
  /** Video URL: direct (e.g. MP4) or YouTube (youtube.com/watch?v=..., youtu.be/...). If not provided, section is not rendered. */
  videoSrc?: string | null;
  /** Optional poster image URL (thumbnail before play). For YouTube, used if provided; otherwise YouTube thumbnail. */
  posterSrc?: string | null;
  /** Optional title above the player. */
  title?: string;
  /** Optional subtitle/description. */
  subtitle?: string;
};

export default function HeroVideoSection({
  videoSrc,
  posterSrc,
  title = "See Our Story",
  subtitle,
}: HeroVideoSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [youtubeStarted, setYoutubeStarted] = useState(true);

  const youtubeId = videoSrc ? getYouTubeVideoId(videoSrc) : null;
  const isYouTube = !!youtubeId;

  const togglePlay = useCallback(() => {
    if (isYouTube) {
      if (!youtubeStarted) setYoutubeStarted(true);
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isYouTube, youtubeStarted]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isYouTube) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, [isYouTube]);

  const requestFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const el = isYouTube ? containerRef.current : videoRef.current;
    if (!el?.requestFullscreen) return;
    el.requestFullscreen();
  }, [isYouTube]);

  if (!videoSrc?.trim()) {
    return null;
  }

  const youtubePoster =
    posterSrc?.trim() ||
    (youtubeId
      ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
      : null);
  const youtubeEmbedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&rel=0`
    : "";

  return (
    <section className="relative">
      {/* Full-bleed video block: edge-to-edge under hero, no side padding */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden bg-black"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative aspect-21/9 min-h-[280px] md:min-h-[320px]">
          {isYouTube ? (
            <>
              {!youtubeStarted ? (
                <>
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={togglePlay}
                    aria-hidden
                  >
                    <img
                      src={youtubePoster ?? ""}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                  </div>
                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={togglePlay}
                    aria-hidden
                  >
                    <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-xl hover:scale-105 transition-transform ring-2 ring-white/50">
                      <Play className="w-10 h-10 text-primary fill-primary ml-1" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <iframe
                    src={youtubeEmbedUrl}
                    title="YouTube video"
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                  <div
                    className={`absolute bottom-0 left-0 right-0 z-10 h-16 bg-linear-to-t from-black/70 to-transparent flex items-center justify-end px-5 transition-opacity duration-300 ${
                      isHovering ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={requestFullscreen}
                      className="p-2.5 rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors"
                      aria-label="Fullscreen"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <video
                ref={videoRef}
                src={videoSrc}
                poster={posterSrc ?? undefined}
                className="w-full h-full object-cover"
                loop
                muted={isMuted}
                autoPlay
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={togglePlay}
              />

              {!isPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 cursor-pointer"
                  onClick={togglePlay}
                  aria-hidden
                >
                  <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-xl hover:scale-105 transition-transform ring-2 ring-white/50">
                    <Play className="w-10 h-10 text-primary fill-primary ml-1" />
                  </div>
                </div>
              )}

              <div
                className={`absolute bottom-0 left-0 right-0 z-10 h-16 bg-linear-to-t from-black/70 to-transparent flex items-center justify-between px-5 transition-opacity duration-300 ${
                  isHovering || isPlaying ? "opacity-100" : "opacity-0"
                }`}
              >
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-2.5 rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  )}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-2.5 rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={requestFullscreen}
                    className="p-2.5 rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors"
                    aria-label="Fullscreen"
                  >
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Title + subtitle overlaid at bottom, over gradient */}
          {(title || subtitle) && (
            <div className="absolute bottom-0 left-0 right-0 z-1 p-6 md:p-8 lg:p-10 pb-20 bg-linear-to-t from-black/85 via-black/50 to-transparent pointer-events-none">
              <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
                {title && (
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 drop-shadow-sm">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-white/90 text-sm md:text-base lg:text-lg max-w-2xl">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-primary via-gold to-primary" />
      </div>
    </section>
  );
}
