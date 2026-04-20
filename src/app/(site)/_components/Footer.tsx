import Logo from "@/components/shared/Logo";
import Image from "next/image";
import Link from "next/link";

/** Footer backdrop (served from /public). */
const FOOTER_BG_IMAGE = "/images/property3.png";

const TAGLINE =
  "Your trusted partner in finding the perfect property. We bring expertise, integrity, and personalized service to every transaction.";

const ADDRESS = "Uttara, Dhaka, Bangladesh";

const PHONE_LINES = [
  "01713 841977",
  "01713 873944",
  "01713 910379",
  "01713 861722",
] as const;

function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:${digits}` : "#";
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate min-h-[min(52vh,520px)] overflow-hidden text-white">
      <Image
        src={FOOTER_BG_IMAGE}
        alt="Footer background image"
        fill
        className="absolute inset-0 size-full object-cover object-top"
        sizes="(max-width: 100%) 100vw"
        priority={false}
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.78)_55%,rgba(0,0,0,0.82)_100%)]"
        aria-hidden
      />

      <div className="relative z-10 container mx-auto px-4 py-14 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="max-w-xl space-y-6">
            <Logo image="/full-logo.png" />
            <div>
              <p className="mt-4 text-pretty text-sm leading-relaxed text-white/85 sm:text-base">
                {TAGLINE}
              </p>
            </div>
          </div>

          <div className="max-w-md space-y-5 lg:justify-self-end">
            <h3 className="text-lg font-bold uppercase tracking-wide text-white sm:text-xl">
              Contact us
            </h3>
            <p className="text-sm leading-relaxed text-white/90 sm:text-base">
              {ADDRESS}
            </p>
            <ul className="space-y-2 text-sm sm:text-base">
              {PHONE_LINES.map((phone) => (
                <li key={phone}>
                  <Link
                    href={telHref(phone)}
                    className="text-white/95 underline decoration-white/35 underline-offset-2 transition-colors hover:text-white"
                  >
                    {phone}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 space-y-2 border-t border-white/25 pt-8 text-xs leading-relaxed text-white/70 sm:text-sm flex items-center justify-between">
          <p>© {year} Sunrise Apartments. All rights reserved.</p>
          <p>
            Site crafted by{" "}
            <a
              href="https://graphland.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/85 underline decoration-white/30 underline-offset-2 transition-colors hover:text-white"
            >
              Graphland
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
