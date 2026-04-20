const PURPOSE =
  "To improve the standard of living of our customers and make them happy.";

const VISION =
  "To become the most trusted and respected real estate company in Bangladesh.";

const VALUES = [
  "Integrity",
  "Respectful and long term partnership",
  "Customer satisfaction",
  "Open and transparent culture",
  "Engaging and growing team members",
] as const;

export default function AboutPurposeValues() {
  return (
    <section
      className="relative overflow-hidden border-t border-border/60 py-16 lg:py-24"
      aria-labelledby="purpose-values-heading"
    >
      <div className="absolute inset-0 bg-background" aria-hidden />
      <div
        className="absolute inset-0 bg-[url('/images/background.svg')] bg-cover bg-center bg-no-repeat opacity-[0.38] motion-reduce:opacity-[0.32]"
        aria-hidden
      />

      <div className="relative z-10 container mx-auto px-4 lg:px-8">
        <h2 id="purpose-values-heading" className="sr-only">
          Purpose, vision, and values
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="border border-border/80 bg-background/95 p-8 shadow-sm sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Purpose
            </p>
            <p className="mt-5 text-balance text-lg font-bold uppercase leading-snug text-foreground sm:text-xl">
              {PURPOSE}
            </p>
          </div>
          <div className="border border-border/80 bg-background/95 p-8 shadow-sm sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Vision
            </p>
            <p className="mt-5 text-balance text-lg font-bold uppercase leading-snug text-foreground sm:text-xl">
              {VISION}
            </p>
          </div>
        </div>

        <div className="mt-6 border border-border/80 bg-background/95 p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Our values
          </p>
          <ul className="mt-6 flex flex-col gap-3 text-sm text-foreground sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-3 sm:text-base">
            {VALUES.map((v) => (
              <li key={v} className="sm:max-w-[min(100%,220px)]">
                {v}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
