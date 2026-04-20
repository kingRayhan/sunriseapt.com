import TestimonialsCarousel, { type TestimonialItem } from "./TestimonialsCarousel";
import { getPublishedTestimonials } from "@/drizzle/queries/testimonials";
import { getCdnImageUrl } from "@/lib/utils";

export const revalidate = 60;

export default async function TestimonialsSection() {
  const rows = await getPublishedTestimonials();
  if (!rows || rows.length === 0) return null;

  const items = rows
    .map<TestimonialItem | null>((t) => {
      const posterUrl = getCdnImageUrl(t.posterKey);
      if (!posterUrl) return null;
      return {
        id: t.id,
        title: t.title,
        shortDescription: t.shortDescription,
        authorName: t.authorName,
        authorTitle: t.authorTitle,
        posterUrl,
        videoUrl: t.videoUrl,
        overlayLine: t.overlayLine,
        projectBrand: t.projectBrand,
      };
    })
    .filter((x): x is TestimonialItem => x !== null);

  if (items.length === 0) return null;

  return <TestimonialsCarousel items={items} />;
}
