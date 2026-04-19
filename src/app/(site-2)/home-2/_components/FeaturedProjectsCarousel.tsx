"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

export type FeaturedProjectCard = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  excerpt: string;
  imageUrl: string | null;
};

/** Keep in sync with Tailwind `gap-*` on the scroller. */
const CARD_GAP_CLASS = "gap-6";
const CARD_GAP_PX = 24;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600566753190-17f0bdf2cb6a?auto=format&fit=crop&q=80&w=1600";

type FeaturedProjectsCarouselProps = {
  projects: FeaturedProjectCard[];
};

function recycleInfiniteScroll(el: HTMLElement) {
  const total = el.scrollWidth;
  const setWidth = total / 3;
  if (setWidth < 16) return;

  const { scrollLeft, clientWidth } = el;
  const threshold = 56;
  let next = scrollLeft;
  let guard = 0;

  while (guard++ < 4) {
    if (next < setWidth - threshold) {
      next += setWidth;
      continue;
    }
    if (next > 2 * setWidth - clientWidth + threshold) {
      next -= setWidth;
      continue;
    }
    break;
  }

  if (next !== scrollLeft) {
    el.scrollLeft = next;
  }
}

function ProjectSlide({
  p,
  eagerImage,
}: {
  p: FeaturedProjectCard;
  eagerImage: boolean;
}) {
  return (
    <article
      data-carousel-card
      className={cn(
        "group relative isolate flex min-h-[min(78vh,720px)] w-[min(100%,360px)] shrink-0 snap-start flex-col sm:min-h-[min(76vh,680px)] sm:w-[min(100%,400px)] lg:w-[min(100%,440px)]",
      )}
    >
      <div className="absolute inset-0 z-0 overflow-hidden bg-muted">
        <img
          src={p.imageUrl ?? FALLBACK_IMAGE}
          alt=""
          loading={eagerImage ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-500 ease-out motion-reduce:transition-none motion-reduce:group-hover:scale-100 group-hover:scale-[1.02]"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.42)_38%,transparent_68%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-black/0 group-hover:bg-black/25 group-focus-within:bg-black/25"
          aria-hidden
        />
      </div>

      <Link
        href={`/properties/${p.slug}`}
        className="absolute inset-0 z-20 outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset motion-reduce:transition-none"
      >
        <span className="sr-only">View {p.title}</span>
      </Link>

      <div className="relative z-30 mt-auto flex w-full flex-col px-7 pb-8 pt-32 text-left text-white pointer-events-none sm:px-9 sm:pb-10 sm:pt-40 lg:px-10 lg:pb-12">
        <div className="min-w-0">
          <h3 className="text-pretty text-2xl font-bold uppercase leading-[1.15] tracking-wide sm:text-3xl lg:text-[2rem] lg:leading-tight">
            {p.title}
          </h3>
          {p.location ? (
            <p className="mt-2 text-sm font-normal text-white/95 sm:text-base">
              {p.location}
            </p>
          ) : null}
          {p.excerpt ? (
            <p
              className={cn(
                "text-pretty pt-4 text-sm leading-relaxed text-white/95 sm:text-[0.9375rem] sm:leading-relaxed",
                "max-h-0 translate-y-2 overflow-hidden opacity-0",
                "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
                "group-hover:max-h-72 group-hover:translate-y-0 group-hover:opacity-100",
                "group-focus-within:max-h-72 group-focus-within:translate-y-0 group-focus-within:opacity-100",
              )}
            >
              {p.excerpt}
            </p>
          ) : null}
        </div>

        <p
          className={cn(
            "mt-4 text-xs font-medium text-white/95 sm:text-sm",
            "max-h-0 translate-y-2 overflow-hidden opacity-0",
            "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
            "group-hover:max-h-14 group-hover:translate-y-0 group-hover:opacity-100",
            "group-focus-within:max-h-14 group-focus-within:translate-y-0 group-focus-within:opacity-100",
          )}
        >
          For apartment tour —{" "}
          <Link
            href="/contact"
            className="pointer-events-auto relative z-30 underline decoration-white/70 underline-offset-2 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            click here
          </Link>
        </p>

        <div className="pointer-events-none mt-6 w-full border border-white/90 px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white sm:mt-8 sm:py-3.5 sm:text-sm">
          Explore
        </div>
      </div>
    </article>
  );
}

export default function FeaturedProjectsCarousel({
  projects,
}: FeaturedProjectsCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const reducedMotionRef = useRef(false);

  const looped = useMemo(
    () => [...projects, ...projects, ...projects],
    [projects],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reducedMotionRef.current = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /** Start on the middle copy so both directions can scroll seamlessly. */
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el || projects.length === 0) return;
    const setWidth = el.scrollWidth / 3;
    if (setWidth < 16) return;
    el.scrollTo({ left: setWidth, behavior: "auto" });
  }, [projects]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || projects.length === 0) return;

    const onScroll = () => {
      recycleInfiniteScroll(el);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend", onScroll);

    const ro = new ResizeObserver(() => {
      recycleInfiniteScroll(el);
    });
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", onScroll);
      ro.disconnect();
    };
  }, [projects.length]);

  const scrollByCards = useCallback(
    (direction: -1 | 1) => {
      const el = scrollerRef.current;
      if (!el || projects.length === 0) return;

      const firstCard = el.querySelector<HTMLElement>("[data-carousel-card]");
      const gapPx =
        Number.parseFloat(getComputedStyle(el).gap) || CARD_GAP_PX;
      const step = (firstCard?.offsetWidth ?? 380) + gapPx;
      const behavior: ScrollBehavior = reducedMotionRef.current
        ? "auto"
        : "smooth";

      el.scrollBy({ left: direction * step, behavior });
    },
    [projects.length],
  );

  if (projects.length === 0) return null;

  const n = projects.length;
  const middleStart = n;

  return (
    <div className="space-y-10 lg:space-y-12">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
        <div className="max-w-5xl space-y-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Featured projects
          </p>
          <h2
            id="featured-projects-heading"
            className="text-balance text-3xl font-bold uppercase leading-[1.12] tracking-tight text-primary sm:text-4xl lg:text-5xl"
          >
            Bespoke enclaves with finesse in architecture and design
          </h2>
        </div>
        <div className="flex shrink-0 justify-end gap-3 sm:pb-1">
          <button
            type="button"
            className="inline-flex size-12 items-center justify-center rounded-full border border-foreground/80 text-foreground hover:opacity-80 motion-reduce:transition-none"
            aria-label="Previous projects"
            onClick={() => scrollByCards(-1)}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            className="inline-flex size-12 items-center justify-center rounded-full border border-foreground/80 text-foreground hover:opacity-80 motion-reduce:transition-none"
            aria-label="Next projects"
            onClick={() => scrollByCards(1)}
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className={cn(
          "-mx-4 flex overflow-x-auto px-4 pb-4 pt-1 snap-x snap-mandatory [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden",
          CARD_GAP_CLASS,
        )}
        role="region"
        aria-labelledby="featured-projects-heading"
      >
        {looped.map((p, i) => (
          <ProjectSlide
            key={`${i}-${p.id}`}
            p={p}
            eagerImage={i === middleStart}
          />
        ))}
      </div>
    </div>
  );
}
