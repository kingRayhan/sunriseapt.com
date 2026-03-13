import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Bed,
  Bath,
  Maximize,
  Calendar,
  MapPin,
  ArrowLeft,
  DownloadIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PropertyCard from "@/components/PropertyCard";
import PropertyImageGallery from "@/components/PropertyImageGallery";
import {
  getPropertyBySlug,
  getRelatedProperties,
} from "@/drizzle/queries/properties";
import { formatPrice } from "@/lib/utils";

interface Props {
  params: { id: string };
}

export default async function PropertyDetailsPage({ params }: Props) {
  const property = await getPropertyBySlug(params.id);

  if (!property) notFound();

  const relatedProperties = await getRelatedProperties(
    property.id,
    property.type,
    3,
  );

  return (
    <div className="pt-20 lg:pt-24">
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/properties">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Properties
          </Link>
        </Button>
      </div>

      <div className="container mx-auto px-4 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PropertyImageGallery
              images={property.images}
              title={property.title}
            />

            <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
              <div>
                <Badge className="mb-2 capitalize">{property.type}</Badge>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  {property.title}
                </h1>
                <p className="flex items-center gap-1.5 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" /> {property.address}
                </p>
              </div>
              {/* <p className="text-2xl lg:text-3xl font-bold text-primary">
                {formatPrice(property.price)}
              </p> */}
            </div>

            <div className="flex flex-wrap gap-6 py-5 border-y border-border mb-6">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Bed className="h-5 w-5" /> {property.bedrooms} Bedrooms
              </span>
              <span className="flex items-center gap-2 text-muted-foreground">
                <Bath className="h-5 w-5" /> {property.bathrooms} Bathrooms
              </span>
              <span className="flex items-center gap-2 text-muted-foreground">
                <Maximize className="h-5 w-5" /> {property.area} sqft
              </span>
              {property.yearBuilt && (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" /> Built {property.yearBuilt}
                </span>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>
            </div>

            {property.projectDetails.length > 0 && (
              <div className="mb-8 rounded-lg border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-semibold">Details</h2>
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Updated on{" "}
                    {new Date(property.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <hr className="border-border my-4" />
                <h3 className="text-base font-semibold mb-1">
                  Project At A Glance
                </h3>
                <hr className="border-border my-4" />
                <div className="divide-y divide-border">
                  {property.projectDetails.map((detail, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between py-3 gap-4"
                    >
                      <span className="font-semibold text-foreground whitespace-nowrap">
                        {detail.label} :
                      </span>
                      <span className="text-muted-foreground text-right">
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Features</h2>
              <div className="flex flex-wrap gap-2">
                {property.features.map((feature) => (
                  <Badge key={feature} variant="secondary">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="sticky top-28 space-y-6">
              <div className="rounded-lg border border-border p-6">
                <h3 className="font-semibold mb-4">
                  Interested in this property?
                </h3>
                {property.brochureKey && (
                  <Button className="w-full mb-3" asChild>
                    <Link href={property.brochureKey}>
                      <DownloadIcon className="h-4 w-4" />
                      Download Brochure
                    </Link>
                  </Button>
                )}

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/contact">Ask a Question</Link>
                </Button>
              </div>

              {property.lat && property.lng && (
                <div className="rounded-lg border border-border overflow-hidden">
                  <iframe
                    title="Property Location"
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${property.lng}!3d${property.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s!5e0!3m2!1sen!2sus`}
                    width="100%"
                    height="250"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {relatedProperties.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProperties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
