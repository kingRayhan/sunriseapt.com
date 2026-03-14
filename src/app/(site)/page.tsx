import CompanyGallery from "@/components/CompanyGallery";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { getGalleryImages } from "@/drizzle/queries/gallery";
import { getFeaturedProperties } from "@/drizzle/queries/properties";
import { getSiteSettings } from "@/drizzle/queries/settings";
import { SETTING_KEYS } from "@/lib/settings-keys";
import HeroCarousel from "@/components/HeroCarousel";
import { getCdnImageUrl } from "@/lib/utils";
import type { HomeSliderSlide } from "@/lib/settings-keys";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { HomeMapSection } from "./HomeMapSection";
import type { HeroSlide } from "@/components/HeroCarousel";

export const revalidate = 60;

function getMapLocation(settings: Record<string, string>) {
  const address = settings[SETTING_KEYS.address]?.trim() || null;
  const latRaw = settings[SETTING_KEYS.address_lat]?.trim();
  const lngRaw = settings[SETTING_KEYS.address_lng]?.trim();
  const lat = latRaw ? Number.parseFloat(latRaw) : NaN;
  const lng = lngRaw ? Number.parseFloat(lngRaw) : NaN;
  const valid =
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);
  return valid ? { lat, lng, address } : null;
}

function parseHomeSlider(settings: Record<string, string>): HomeSliderSlide[] {
  const raw = settings[SETTING_KEYS.home_slider]?.trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as HomeSliderSlide[]) : [];
  } catch {
    return [];
  }
}

function getHeroSlides(settings: Record<string, string>): HeroSlide[] {
  const slides = parseHomeSlider(settings);
  const result: HeroSlide[] = [];
  for (const s of slides) {
    const image = getCdnImageUrl(s.imageKey);
    if (image) result.push({ image, title: s.title, subtitle: s.subtitle, link: s.link });
  }
  return result;
}

export default async function HomePage() {
  const [featuredProperties, galleryImages, settings] = await Promise.all([
    getFeaturedProperties(),
    getGalleryImages(),
    getSiteSettings(),
  ]);
  const mapLocation = getMapLocation(settings);
  const heroSlides = getHeroSlides(settings);

  return (
    <>
      <HeroCarousel slides={heroSlides} />

      {/* About / Mission / Vision */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-3 gap-x-8 gap-y-10">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">About Us</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sunrise Apartments ltd is a Real Estate company that creates
                living spaces that seamlessly blend luxury and nature. We
                believe that everyone deserves to live in a beautiful,
                sustainable environment, and we are committed to creating
                apartments that are both stylish and eco-friendly.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden aspect-4/3">
              <img
                src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800"
                alt="Nature and sustainability"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">Mission</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our team of architects and designers has meticulously designed
                these apartments to maximize natural light, optimize space, and
                incorporate sustainability. The result is a space that offers
                comfort and luxury while harmonizing with nature.
              </p>
            </div>

            <div className="rounded-lg overflow-hidden aspect-4/3">
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800"
                alt="Construction and development"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">Vision</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                &ldquo;Sunrise Apartments Ltd. our goal is simple yet powerful:
                turning dreams into reality. We strive to create exceptional
                living spaces that embody innovation, quality, and dedication.
                Our vision is to set new standard in the real estate industry,
                redefining urban living with excellence.
              </p>
            </div>
            <div className="relative rounded-lg overflow-hidden aspect-4/3">
              <img
                src="https://images.unsplash.com/photo-1563811771046-ba984ff30900?w=800"
                alt="Building with care"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-4">
                <Button
                  size="sm"
                  className="bg-gold hover:bg-gold-dark text-white"
                  asChild
                >
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
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Featured Properties
              </h2>
              <p className="text-muted-foreground">
                Hand-picked properties for you
              </p>
            </div>
            <Button
              variant="ghost"
              asChild
              className="hidden md:flex text-primary hover:text-gold-dark"
            >
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

      <CompanyGallery images={galleryImages} />

      <HomeMapSection mapLocation={mapLocation} />
    </>
  );
}
