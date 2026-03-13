import CompanyGallery from "@/components/CompanyGallery";
import HeroCarousel from "@/components/HeroCarousel";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { getFeaturedProperties } from "@/drizzle/queries/properties";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const featuredProperties = await getFeaturedProperties();

  return (
    <>
      <HeroCarousel />

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
                Our team of architects and designers has meticulously designed
                these apartments to maximize natural light, optimize space, and
                incorporate sustainability. The result is a space that offers
                comfort and luxury while harmonizing with nature.
              </p>
            </div>

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
                &ldquo;Sunrise Apartments Ltd. our goal is simple yet powerful:
                turning dreams into reality. We strive to create exceptional
                living spaces that embody innovation, quality, and dedication.
                Our vision is to set new standard in the real estate industry,
                redefining urban living with excellence.
              </p>
            </div>
            <div className="relative rounded-lg overflow-hidden aspect-[4/3]">
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

      <CompanyGallery />

      {/* Map Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
              Our Locations
            </h2>
            <p className="text-muted-foreground">
              Explore properties across South Florida
            </p>
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
