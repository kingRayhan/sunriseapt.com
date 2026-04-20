import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/site-2/PageHero";
import { getProperties } from "@/drizzle/queries/properties";
import { getCdnImageUrl } from "@/lib/utils";
import { SITE_NAME } from "@/lib/seo";
import { Bed, Bath, Maximize, ArrowRight } from "lucide-react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=2400";

export const metadata: Metadata = {
  title: "Projects",
  description: `Explore current residential projects by ${SITE_NAME}.`,
};

export const revalidate = 60;

function formatArea(area: string | number): string {
  const num = typeof area === "string" ? Number.parseFloat(area) : area;
  if (!Number.isFinite(num)) return "";
  return `${Math.round(num).toLocaleString("en-US")} sqft`;
}

export default async function Site2ProjectsPage() {
  const properties = await getProperties();

  return (
    <main>
      <PageHero
        title="Projects"
        backgroundImage={HERO_IMAGE}
        imageAlt="Modern residential building facade"
        minHeightClassName="min-h-[min(52vh,560px)]"
      />

      <section
        className="border-t border-border/60 bg-background py-16 lg:py-24"
        aria-labelledby="projects-heading"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-10 flex flex-col gap-3 lg:mb-12">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Our work
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2
                id="projects-heading"
                className="text-balance text-3xl font-bold uppercase tracking-tight text-primary sm:text-4xl"
              >
                Available projects
              </h2>
              <p className="text-sm text-muted-foreground">
                Showing {properties.length} project
                {properties.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {properties.length === 0 ? (
            <div className="rounded-lg border border-border/60 bg-muted/20 p-10 text-center">
              <p className="text-sm text-muted-foreground">
                No projects are available right now.
              </p>
              <Link
                href="/home-2/contact"
                className="mt-4 inline-flex items-center justify-center border border-primary px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/10"
              >
                Contact us
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => {
                const coverKey = p.images[0];
                const coverUrl = coverKey ? getCdnImageUrl(coverKey) : null;
                return (
                  <Link
                    key={p.id}
                    href={`/home-2/properties/${p.slug}`}
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
                        <div className="absolute inset-0 bg-muted" aria-hidden />
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

                    <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Bed className="h-4 w-4" aria-hidden />
                        {p.bedrooms} bed
                        {p.bedrooms === 1 ? "" : "s"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Bath className="h-4 w-4" aria-hidden />
                        {p.bathrooms} bath
                        {p.bathrooms === 1 ? "" : "s"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Maximize className="h-4 w-4" aria-hidden />
                        {formatArea(p.area)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

