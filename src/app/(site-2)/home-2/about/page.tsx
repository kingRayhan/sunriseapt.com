import PageHero from "@/components/site-2/PageHero";
import TeamCarousel from "@/components/site-2/TeamCarousel";
import { getTeamMembers } from "@/drizzle/queries/team";
import { getCdnImageUrl } from "@/lib/utils";
import { SITE_NAME } from "@/lib/seo";
import type { Metadata } from "next";
import AboutChairman from "./_components/AboutChairman";
import AboutPurposeValues from "./_components/AboutPurposeValues";
import AboutWhoWeAre from "./_components/AboutWhoWeAre";

const ABOUT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=2400";

export const metadata: Metadata = {
  title: "About us",
  description: `Learn about ${SITE_NAME} — our purpose, team, and how we build trusted residential communities.`,
};

export const revalidate = 60;

export default async function AboutPage() {
  const teamMembers = await getTeamMembers();

  const carouselMembers = teamMembers.map((m) => ({
    id: m.id,
    name: m.name.toUpperCase(),
    role: m.role,
    imageSrc: m.imageKey ? getCdnImageUrl(m.imageKey) ?? "" : "",
    imageAlt: m.name,
  }));

  return (
    <main>
      <PageHero
        title="About us"
        backgroundImage={ABOUT_HERO_IMAGE}
        imageAlt="City skyline at dusk"
        minHeightClassName="min-h-[min(52vh,560px)]"
      />
      <AboutWhoWeAre />
      <AboutPurposeValues />
      <AboutChairman />
      <TeamCarousel
        eyebrow="Team"
        title="Management team"
        members={carouselMembers}
        moreHref="/contact"
        moreLabel="More about our team"
      />
    </main>
  );
}
