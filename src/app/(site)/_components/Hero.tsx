"use client";

import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const AUTO_MS = 6000;

const FALLBACK_SLIDES = [
  {
    id: "1",
    title: "Redefining happiness",
    image: "/images/property3.png",
    alt: "Aerial view of a luxury residential property with pool and gardens",
    description:
      "A refined residential experience shaped by thoughtful planning, open green space, and the comfort of modern amenities—built for everyday ease and long‑term value.",
  },
  {
    id: "2",
    title: "Where luxury meets nature",
    image: "/images/property1.jpeg",
    alt: "Modern architecture with swimming pool at dusk",
    description:
      "Contemporary architecture balanced with natural light and calm surroundings—so your home feels private, peaceful, and connected to the city when you need it.",
  },
  {
    id: "3",
    title: "Spaces designed for living",
    image: "/images/property2.jpeg",
    alt: "Contemporary high-rise residential towers",
    description:
      "Smart layouts, quality finishes, and dependable delivery—crafted for families who want functional spaces today and a home they’ll be proud of tomorrow.",
  },
] as const;

const PROJECT_FILTERS = [
  "Ongoing",
  "Handed over",
  "Upcoming",
  "Ready",
] as const;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export type HeroSlide = {
  id: string;
  title: string;
  image: string;
  alt: string;
  description: string;
  link?: string;
};

export default function Hero({ slides }: { slides?: HeroSlide[] }) {
  const SLIDES = (
    slides && slides.length > 0 ? slides : FALLBACK_SLIDES
  ) as readonly HeroSlide[];
  const slidesLen = SLIDES.length;
  const [index, setIndex] = useState(0);
  const [tabVisible, setTabVisible] = useState(true);
  const reducedMotion = usePrefersReducedMotion();

  const goTo = useCallback(
    (i: number) => {
      setIndex(((i % slidesLen) + slidesLen) % slidesLen);
    },
    [slidesLen],
  );

  useEffect(() => {
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    onVis();
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (reducedMotion || !tabVisible) return;

    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slidesLen);
    }, AUTO_MS);

    return () => window.clearInterval(id);
  }, [reducedMotion, tabVisible, slidesLen]);

  const whatsappDigits = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(
    /\D/g,
    "",
  );
  const whatsappHref = whatsappDigits
    ? `https://wa.me/${whatsappDigits}`
    : "/contact";

  return (
    <section
      className="relative isolate flex min-h-dvh w-full flex-col bg-black text-white"
      aria-roledescription="carousel"
      aria-label="Featured homepage highlights"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className={cn(
            "flex h-full w-[300vw]",
            !reducedMotion && "transition-transform duration-500 ease-out",
          )}
          style={{ transform: `translateX(-${index * 100}vw)` }}
        >
          {SLIDES.map((slide, i) => (
            <div
              key={slide.id}
              id={`hero-slide-${slide.id}`}
              role="tabpanel"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${SLIDES.length}`}
              aria-hidden={i !== index}
              className="relative h-dvh w-screen shrink-0"
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={i === 0}
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-black/35" aria-hidden />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-32 pt-24 text-center sm:pb-36 sm:pt-28">
        <h1 className="max-w-4xl text-balance text-3xl font-bold uppercase sm:text-4xl md:text-5xl lg:text-6xl">
          {SLIDES[index]?.title}
        </h1>
        <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed text-white/85 sm:text-lg">
          {SLIDES[index]?.description}
        </p>
      </div>

      <div
        className="absolute right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-3 sm:right-6"
        style={{
          paddingRight: "max(0px, env(safe-area-inset-right))",
        }}
        role="tablist"
        aria-label="Choose slide"
      >
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            id={`hero-tab-${slide.id}`}
            aria-selected={i === index}
            aria-controls={`hero-slide-${slide.id}`}
            tabIndex={i === index ? 0 : -1}
            onClick={() => goTo(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                e.preventDefault();
                const next = (i + 1) % SLIDES.length;
                goTo(next);
                requestAnimationFrame(() => {
                  document
                    .getElementById(`hero-tab-${SLIDES[next]!.id}`)
                    ?.focus();
                });
              }
              if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                e.preventDefault();
                const prev = (i - 1 + SLIDES.length) % SLIDES.length;
                goTo(prev);
                requestAnimationFrame(() => {
                  document
                    .getElementById(`hero-tab-${SLIDES[prev]!.id}`)
                    ?.focus();
                });
              }
            }}
            className={cn(
              "size-2.5 rounded-full border border-white/80 transition-opacity duration-200 ease-out",
              i === index
                ? "bg-white opacity-100"
                : "bg-transparent opacity-50 hover:opacity-80",
            )}
            aria-label={`Show slide ${i + 1}: ${slide.title}`}
          />
        ))}
      </div>

      <footer className="relative z-30 mt-auto flex flex-col gap-4 border-t border-white/10 bg-black px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <Link
          href="/#projects"
          className="flex items-center gap-2 text-sm font-medium uppercase transition-opacity duration-200 ease-out hover:opacity-90"
        >
          <Building2 className="size-5 shrink-0" aria-hidden />
          Explore projects
        </Link>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold uppercase sm:text-sm">
          {PROJECT_FILTERS.map((label) => (
            <li key={label}>
              <Link
                href="#projects"
                className="text-white/85 transition-opacity duration-200 ease-out hover:opacity-100"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </footer>

      <a
        href={whatsappHref}
        target={whatsappDigits ? "_blank" : undefined}
        rel={whatsappDigits ? "noopener noreferrer" : undefined}
        className="fixed bottom-6 right-6 z-30 flex size-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-opacity duration-200 ease-out hover:opacity-90"
        style={{
          bottom: "max(1.5rem, env(safe-area-inset-bottom))",
          right: "max(1.5rem, env(safe-area-inset-right))",
        }}
        aria-label={whatsappDigits ? "Chat on WhatsApp" : "Contact us"}
      >
        <Image
          src="/whatsapp.svg"
          alt=""
          width={28}
          height={28}
          className="size-7"
        />
      </a>
    </section>
  );
}
