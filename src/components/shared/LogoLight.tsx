import Image from "next/image";

/** White / inverted mark for dark backgrounds (e.g. hero, footer). */
export default function LogoLight() {
  return (
    <div>
      <Image
        src="/full-logo.png"
        alt="Sunrise Apartments"
        className="h-14 w-auto brightness-0 invert sm:h-16"
        width={300}
        height={300}
      />
    </div>
  );
}
