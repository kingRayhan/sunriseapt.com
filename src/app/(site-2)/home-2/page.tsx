import AboutUsSection from "./_components/AboutUsSection";
import FeaturedProjectsSection from "./_components/FeaturedProjectsSection";
import Hero from "./_components/Hero";
import ScheduleMeetingSection from "./_components/ScheduleMeetingSection";
import ShowcaseVideoSection from "./_components/ShowcaseVideoSection";
import TestimonialsSection from "./_components/TestimonialsSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutUsSection />
      <FeaturedProjectsSection />
      <TestimonialsSection />
      <ShowcaseVideoSection />
      <ScheduleMeetingSection />
    </>
  );
}
