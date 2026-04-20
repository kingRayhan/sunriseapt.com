import Hero from "./Hero";
import { getSiteSettings } from "@/drizzle/queries/settings";
import { SETTING_KEYS, type HomeSliderSlide } from "@/lib/settings-keys";
import { getCdnImageUrl } from "@/lib/utils";

type HeroSlide = {
  id: string;
  title: string;
  image: string;
  alt: string;
  description: string;
  link?: string;
};

function parseHomeSlider(value: string): HomeSliderSlide[] {
  if (!value || value.trim() === "") return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as HomeSliderSlide[]) : [];
  } catch {
    return [];
  }
}

export const revalidate = 60;

export default async function HeroSection() {
  const settings = await getSiteSettings();
  const raw = settings[SETTING_KEYS.home_slider] ?? "";
  const slides = parseHomeSlider(raw)
    .map((s, i): HeroSlide | null => {
      const url = s.imageKey ? getCdnImageUrl(s.imageKey) : null;
      if (!url) return null;
      const title = (s.title ?? "").trim();
      const description = (s.description ?? "").trim();
      const alt = (s.alt ?? "").trim();
      return {
        id: `settings-${i + 1}`,
        title: title || "Sunrise Apartments",
        image: url,
        alt: alt || title || `Hero slide ${i + 1}`,
        description:
          description ||
          "Premium residential living with thoughtful planning and dependable delivery.",
        ...(s.link ? { link: s.link } : {}),
      };
    })
    .filter((x): x is HeroSlide => x != null);

  return <Hero slides={slides.length > 0 ? slides : undefined} />;
}

