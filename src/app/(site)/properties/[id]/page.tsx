import PropertyImageGallery from "@/components/PropertyImageGallery";
import Markdown from "@/components/shared/Markdown";
import PageHero from "@/components/site-2/PageHero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getPropertyBySlug,
  getRelatedProperties,
} from "@/drizzle/queries/properties";
import { SITE_NAME } from "@/lib/seo";
import { getCdnImageUrl } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  Bed,
  DownloadIcon,
  MapPin,
  Maximize,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

function formatArea(area: string | number): string {
  const num = typeof area === "string" ? Number.parseFloat(area) : area;
  if (!Number.isFinite(num)) return "";
  return `${Math.round(num).toLocaleString("en-US")} sqft`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyBySlug(id);
  if (!property) return { title: `Project | ${SITE_NAME}` };

  const coverKey = property.images[0];
  const coverUrl = coverKey ? getCdnImageUrl(coverKey) : null;

  return {
    title: property.title,
    description:
      property.description?.slice(0, 160) ||
      `Explore ${property.title} by ${SITE_NAME}.`,
    openGraph: coverUrl
      ? {
          images: [{ url: coverUrl, alt: property.title }],
        }
      : undefined,
  };
}

export const revalidate = 60;

export default async function Site2ProjectDetailsPage({ params }: Props) {
  const { id } = await params;
  const property = await getPropertyBySlug(id);
  if (!property) notFound();

  const heroImage =
    (property.images[0] ? getCdnImageUrl(property.images[0]) : null) ??
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=2400";

  const imageUrls = property.images
    .map((k) => getCdnImageUrl(k))
    .filter((u): u is string => u != null);

  const related = await getRelatedProperties(property.id, property.type, 3);

  return (
    <main>
      <PageHero
        title={property.title}
        backgroundImage={heroImage}
        imageAlt={property.title}
        minHeightClassName="min-h-[min(52vh,560px)]"
      />

      <section className="border-t border-border/60 bg-background py-10 lg:py-14">
        <div className="container mx-auto px-4 lg:px-8">
          <Button
            variant="outline"
            className="border-foreground/25 bg-transparent"
            asChild
          >
            <Link href="/properties">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
              Back to projects
            </Link>
          </Button>
        </div>
      </section>

      <section
        className="border-t border-border/60 bg-background py-16 lg:py-24"
        aria-labelledby="project-details-heading"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
            <div className="lg:col-span-2">
              {imageUrls.length > 0 ? (
                <PropertyImageGallery
                  images={imageUrls}
                  title={property.title}
                />
              ) : null}

              <div className="mb-8">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Project
                </p>
                <h2
                  id="project-details-heading"
                  className="text-balance text-3xl font-bold uppercase tracking-tight text-primary sm:text-4xl"
                >
                  {property.title}
                </h2>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge className="capitalize">{property.type}</Badge>
                  {property.location ? (
                    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" aria-hidden />
                      {property.location}
                    </span>
                  ) : null}
                </div>
                {property.address ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {property.address}
                  </p>
                ) : null}
              </div>

              <div className="mb-10 grid gap-3 border-y border-border/60 py-5 sm:grid-cols-3">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Bed className="h-4 w-4" aria-hidden /> {property.bedrooms}{" "}
                  bedrooms
                </div>
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Bath className="h-4 w-4" aria-hidden /> {property.bathrooms}{" "}
                  bathrooms
                </div>
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Maximize className="h-4 w-4" aria-hidden />{" "}
                  {formatArea(property.area)}
                </div>
              </div>

              {property.description ? (
                <div className="mb-10">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                    Description
                  </h3>
                  <Markdown
                    content={property.description}
                    className="mt-4 text-muted-foreground"
                  />
                </div>
              ) : null}

              {property.features.length > 0 ? (
                <div className="mb-10">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                    Features
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {property.features.map((f) => (
                      <Badge key={f} variant="secondary">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-sm border border-border/60 bg-muted/20 p-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  Interested?
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get details, availability, and brochure.
                </p>

                <div className="mt-6 grid gap-3">
                  {property.brochureKey &&
                  getCdnImageUrl(property.brochureKey) ? (
                    <Button className="w-full" asChild>
                      <Link
                        href={getCdnImageUrl(property.brochureKey)!}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <DownloadIcon className="mr-2 h-4 w-4" aria-hidden />
                        Download brochure
                      </Link>
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    className="w-full border-foreground/25 bg-transparent hover:bg-muted/60"
                    asChild
                  >
                    <Link href="/contact">
                      Contact us
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </div>
              </div>
            </aside>
          </div>

          {related.length > 0 ? (
            <div className="mt-16 border-t border-border/60 pt-12">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    More
                  </p>
                  <h3 className="text-balance text-2xl font-bold uppercase tracking-tight text-primary sm:text-3xl">
                    Similar projects
                  </h3>
                </div>
                <Link
                  href="/properties"
                  className="inline-flex items-center text-sm font-medium text-foreground hover:opacity-80"
                >
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => {
                  const coverKey = p.images[0];
                  const coverUrl = coverKey ? getCdnImageUrl(coverKey) : null;
                  return (
                    <Link
                      key={p.id}
                      href={`/properties/${p.slug}`}
                      className="group relative overflow-hidden rounded-sm border border-border/60 bg-muted transition-colors hover:bg-muted/60"
                    >
                      <div className="relative aspect-4/3 bg-muted">
                        {coverUrl ? (
                          <img
                            src={coverUrl}
                            alt={p.title}
                            className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className="absolute inset-0 bg-muted"
                            aria-hidden
                          />
                        )}
                        <div
                          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.78)_0%,transparent_60%)]"
                          aria-hidden
                        />
                        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                          <p className="text-sm font-bold uppercase tracking-wide">
                            {p.title}
                          </p>
                          {p.location ? (
                            <p className="mt-1 text-xs text-white/85">
                              {p.location}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
