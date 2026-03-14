"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEFAULT_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600",
    title: "Find Your Dream Home",
    subtitle: "Premium properties in South Florida's most desirable locations",
    link: "/properties",
  },
];

export type HeroSlide = {
  image: string;
  title?: string;
  subtitle?: string;
  link?: string;
};

type HeroCarouselProps = {
  slides?: HeroSlide[];
};

export default function HeroCarousel({ slides: slidesProp }: HeroCarouselProps) {
  const slides = slidesProp?.length ? slidesProp : DEFAULT_SLIDES;
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[currentSlide];

  return (
    <section className="relative h-screen">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title ?? `Slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/50" />
        </div>
      ))}

      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl">
            {(current.title || current.subtitle) && (
              <>
                {current.title && (
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                    {current.title}
                  </h1>
                )}
                {current.subtitle && (
                  <p className="text-lg md:text-xl text-white/80 mb-8">
                    {current.subtitle}
                  </p>
                )}
              </>
            )}
            <div className="flex gap-4">
              {current.link ? (
                <Button size="lg" asChild className="bg-gold hover:bg-gold-dark text-white">
                  <Link href={current.link}>Learn more</Link>
                </Button>
              ) : (
                <Button size="lg" asChild className="bg-gold hover:bg-gold-dark text-white">
                  <Link href="/properties">Browse Properties</Link>
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white text-white hover:bg-white/20"
                asChild
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
          <button
            onClick={() =>
              setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
            }
            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === currentSlide ? "bg-white" : "bg-white/40"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() =>
              setCurrentSlide((prev) => (prev + 1) % slides.length)
            }
            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </section>
  );
}
