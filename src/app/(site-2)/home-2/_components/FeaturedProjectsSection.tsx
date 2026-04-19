import { getAllProperties } from "@/drizzle/queries/properties";
import { getCdnImageUrl } from "@/lib/utils";
import FeaturedProjectsCarousel from "./FeaturedProjectsCarousel";

function excerptFromDescription(text: string | null, max = 240): string {
  if (!text?.trim()) return "";
  const normalized = text.trim().replace(/\s+/g, " ");
  if (normalized.length <= max) return normalized;
  const slice = normalized.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  const trimmed =
    lastSpace > Math.floor(max * 0.55) ? slice.slice(0, lastSpace) : slice;
  return `${trimmed}…`;
}

export default async function FeaturedProjectsSection() {
  const rows = await getAllProperties();
  const projects = rows.slice(0, 16).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    location: p.location,
    excerpt: excerptFromDescription(p.description),
    imageUrl: p.images[0] ? getCdnImageUrl(p.images[0]) : null,
  }));

  if (projects.length === 0) return null;

  return (
    <section
      id="projects"
      className="border-t border-border/60 bg-background py-16 lg:py-24"
      aria-labelledby="featured-projects-heading"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <FeaturedProjectsCarousel projects={projects} />
      </div>
    </section>
  );
}
