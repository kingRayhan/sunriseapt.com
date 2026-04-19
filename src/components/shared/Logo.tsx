import Image from "next/image";

export default function Logo() {
  return (
    <div>
      <Image
        src="/full-logo.png"
        alt="Sunrise Apartments"
        className="h-14 w-auto"
        width={300}
        height={300}
      />
    </div>
  );
}
