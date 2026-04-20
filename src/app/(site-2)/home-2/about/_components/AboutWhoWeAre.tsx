import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const SIDE_IMAGE = "/images/property2.jpeg";

export default function AboutWhoWeAre() {
  return (
    <section
      className="border-t border-border/60 bg-background py-16 lg:py-24"
      aria-labelledby="who-we-are-heading"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:gap-16">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-primary">
              Who we are
            </p>
            <h2
              id="who-we-are-heading"
              className="mb-6 text-balance text-3xl font-bold uppercase tracking-tight text-primary sm:text-4xl"
            >
              Building homes people trust
            </h2>
            <div className="text-pretty space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Sunrise Apartments</strong>{" "}
                has grown from a focused residential developer into a team known
                for thoughtful layouts, dependable delivery, and places people
                are proud to call home.
              </p>
              <p>
                We pair architectural clarity with sustainable choices so each
                project reflects both its neighborhood and the way families want
                to live today—from concept through handover and long after.
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-8 border-primary bg-transparent hover:bg-primary/10"
              asChild
            >
              <Link href="/home-2/contact">Read more</Link>
            </Button>
          </div>

          <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg border border-border/60 bg-muted shadow-sm lg:aspect-[5/4]">
            <Image
              src={SIDE_IMAGE}
              alt="Modern residential towers at dusk"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
