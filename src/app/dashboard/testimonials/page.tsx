import { getAllTestimonials } from "@/drizzle/queries/testimonials";
import { TestimonialsManager } from "@/components/dashboard/testimonials-manager";

export const revalidate = 60;

export default async function DashboardTestimonialsPage() {
  const testimonials = await getAllTestimonials();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Testimonials</h1>
        <p className="text-muted-foreground">
          Manage the “What customers say about us” section.
        </p>
      </div>
      <TestimonialsManager testimonials={testimonials} />
    </div>
  );
}

