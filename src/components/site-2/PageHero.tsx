import { cn } from "@/lib/utils";

export type PageHeroProps = {
  /** Main heading (e.g. “About us”) — shown in large white uppercase type. */
  title: string;
  /** Background image URL (e.g. `/hero.jpg` or full CDN URL). */
  backgroundImage: string;
  /** Pass `""` for purely decorative photography. */
  imageAlt?: string;
  className?: string;
  /** Override default dark gradient for text contrast. */
  overlayClassName?: string;
  /** Minimum block height, e.g. `min-h-[55vh]`. */
  minHeightClassName?: string;
  /** Optional element `id` for the main heading (anchor + `aria-labelledby`). */
  headingId?: string;
};

/**
 * Reusable full-bleed inner-page hero: background image + gradient + title.
 * Use on About, Projects, Blog index, etc.
 */
export default function PageHero({
  title,
  backgroundImage,
  imageAlt = "",
  className,
  overlayClassName,
  minHeightClassName = "min-h-[min(48vh,520px)]",
  headingId = "page-hero-title",
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate flex w-full flex-col justify-end overflow-hidden",
        minHeightClassName,
        className,
      )}
      aria-labelledby={headingId}
    >
      <img
        src={backgroundImage}
        alt={imageAlt}
        className="absolute inset-0 size-full object-cover object-center"
      />
      <div
        className={cn(
          "absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.45)_45%,rgba(0,0,0,0.35)_100%)]",
          overlayClassName,
        )}
        aria-hidden
      />
      <div className="relative z-10 container mx-auto px-4 pb-12 pt-28 sm:pt-32 lg:px-8 lg:pb-16 lg:pt-40">
        <h1
          id={headingId}
          className="max-w-4xl text-balance text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          {title}
        </h1>
      </div>
    </section>
  );
}
