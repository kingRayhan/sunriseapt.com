import Image from "next/image";

const PORTRAIT =
  "https://images.unsplash.com/photo-1560250097-190b87022188?auto=format&fit=crop&q=80&w=900";

export default function AboutChairman() {
  return (
    <section
      className="border-t border-border/60 bg-background py-16 lg:py-24"
      aria-labelledby="chairman-heading"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Chairman
            </p>
            <h2
              id="chairman-heading"
              className="mb-6 text-balance text-2xl font-bold uppercase tracking-tight text-primary sm:text-3xl lg:text-4xl"
            >
              Leadership message
            </h2>
            <div className="text-pretty space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                Our vision is to make high-quality residences accessible to more
                families while raising the bar for transparency, timelines, and
                after-sales care across every project we deliver.
              </p>
              <p>
                We listen closely to buyers and partners, invest in detail where it
                matters most, and treat every handover as the beginning of a long-term
                relationship—not the end of a transaction.
              </p>
            </div>
          </div>

          <div className="order-1 justify-self-center lg:order-2 lg:justify-self-end">
            <div className="relative aspect-3/4 w-full max-w-md overflow-hidden rounded-lg border border-border/60 bg-muted shadow-md">
              <Image
                src={PORTRAIT}
                alt="Chairman portrait"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 480px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
