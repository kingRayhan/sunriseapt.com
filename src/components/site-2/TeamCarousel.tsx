"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef } from "react";

export type TeamCarouselMember = {
  id: string;
  name: string;
  role?: string | null;
  imageSrc: string;
  imageAlt?: string;
};

const GAP_PX = 16;

export type TeamCarouselProps = {
  /** Small label above the title (e.g. “Team”). */
  eyebrow?: string;
  title: string;
  members: TeamCarouselMember[];
  /** Optional CTA below the strip (e.g. /team). */
  moreHref?: string;
  moreLabel?: string;
  className?: string;
  /** `id` for the section heading (a11y). */
  sectionId?: string;
};

/**
 * Horizontal team strip with prev/next — reuse on About, Careers, etc.
 */
export default function TeamCarousel({
  eyebrow = "Team",
  title,
  members,
  moreHref,
  moreLabel = "More about our team",
  className,
  sectionId = "team-carousel-heading",
}: TeamCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el || members.length === 0) return;
    const card = el.querySelector<HTMLElement>("[data-team-card]");
    const gap = Number.parseFloat(getComputedStyle(el).gap) || GAP_PX;
    const step = (card?.offsetWidth ?? 240) + gap;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, [members.length]);

  if (members.length === 0) return null;

  return (
    <section
      className={cn("border-t border-border/60 bg-background py-16 lg:py-24", className)}
      aria-labelledby={sectionId}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between lg:mb-12">
          <div className="space-y-3">
            {eyebrow ? (
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {eyebrow}
              </p>
            ) : null}
            <h2
              id={sectionId}
              className="text-balance text-3xl font-bold uppercase tracking-tight text-primary sm:text-4xl"
            >
              {title}
            </h2>
          </div>
          <div className="flex shrink-0 justify-end gap-2">
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full border border-foreground/80 text-foreground hover:opacity-80"
              aria-label="Previous team members"
              onClick={() => scrollBy(-1)}
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full border border-foreground/80 text-foreground hover:opacity-80"
              aria-label="Next team members"
              onClick={() => scrollBy(1)}
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="-mx-4 flex gap-4 overflow-x-auto scroll-smooth px-4 pb-2 snap-x snap-mandatory [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
          role="list"
        >
          {members.map((m) => (
            <article
              key={m.id}
              data-team-card
              role="listitem"
              className="group relative aspect-3/4 w-[min(100%,220px)] shrink-0 snap-start overflow-hidden rounded-sm border border-border/60 bg-muted sm:w-[240px] lg:w-[260px]"
            >
              <img
                src={m.imageSrc}
                alt={m.imageAlt ?? ""}
                className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <div
                className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,transparent_55%)]"
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 z-10 p-4 text-white">
                <p className="text-sm font-bold uppercase leading-tight tracking-wide sm:text-base">
                  {m.name}
                </p>
                {m.role ? (
                  <p className="mt-1 text-xs font-normal text-white/90 sm:text-sm">
                    {m.role}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        {moreHref ? (
          <div className="mt-10">
            <Link
              href={moreHref}
              className="inline-flex border border-primary px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/10"
            >
              {moreLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
