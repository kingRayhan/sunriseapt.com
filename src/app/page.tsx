"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/PropertyCard";
import CompanyGallery from "@/components/CompanyGallery";
import { properties } from "@/data/properties";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600",
    title: "Find Your Dream Home",
    subtitle: "Premium properties in South Florida's most desirable locations",
  },
  {
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600",
    title: "Luxury Living Awaits",
    subtitle: "Curated selection of waterfront villas and modern penthouses",
  },
  {
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600",
    title: "Invest in Your Future",
    subtitle: "Expert guidance through every step of your property journey",
  },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const featuredProperties = properties.filter((p) => p.featured);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Hero Carousel */}
      <section className="relative h-screen">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-foreground/50" />
          </div>
        ))}

        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {heroSlides[currentSlide].title}
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8">
                {heroSlides[currentSlide].subtitle}
              </p>
              <div className="flex gap-4">
                <Button size="lg" asChild className="bg-gold hover:bg-gold-dark text-white">
                  <Link href="/properties">Browse Properties</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20" asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === currentSlide ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* About / Mission / Vision */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-3 gap-x-8 gap-y-10">
            {/* Row 1 */}
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">About Us</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sunrise Apartments ltd is a Real Estate company that creates living spaces that
                seamlessly blend luxury and nature. We believe that everyone deserves to live in a
                beautiful, sustainable environment, and we are committed to creating apartments that
                are both stylish and eco-friendly.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800"
                alt="Nature and sustainability"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">Mission</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our team of architects and designers has meticulously designed these apartments to
                maximize natural light, optimize space, and incorporate sustainability. The result is
                a space that offers comfort and luxury while harmonizing with nature.
              </p>
            </div>

            {/* Row 2 */}
            <div className="rounded-lg overflow-hidden aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800"
                alt="Construction and development"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">Vision</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                &ldquo;Sunrise Apartments Ltd. our goal is simple yet powerful: turning dreams into
                reality. We strive to create exceptional living spaces that embody innovation,
                quality, and dedication. Our vision is to set new standard in the real estate
                industry, redefining urban living with excellence.
              </p>
            </div>
            <div className="relative rounded-lg overflow-hidden aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1563811771046-ba984ff30900?w=800"
                alt="Building with care"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-4">
                <Button size="sm" className="bg-gold hover:bg-gold-dark text-white" asChild>
                  <Link href="/contact">Contact us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">Featured Properties</h2>
              <p className="text-muted-foreground">Hand-picked properties for you</p>
            </div>
            <Button variant="ghost" asChild className="hidden md:flex text-primary hover:text-gold-dark">
              <Link href="/properties">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Button asChild>
              <Link href="/properties">View All Properties</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Company Gallery */}
      <CompanyGallery />

      {/* Map Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">Our Locations</h2>
            <p className="text-muted-foreground">Explore properties across South Florida</p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg border border-border">
            <iframe
              title="Property Locations"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d229688.1133788853!2d-80.34789824!3d25.78208485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d9b0a20ec8c111%3A0xff96f271ddad4f65!2sMiami%2C%20FL!5e0!3m2!1sen!2sus!4v1710000000000!5m2!1sen!2sus"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
