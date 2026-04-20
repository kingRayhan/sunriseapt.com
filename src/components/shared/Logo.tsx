import { cn } from "@/lib/utils";
import Image from "next/image";

export type LogoProps = {
  className?: string;
  /**
   * `default`: use the image as-is
   * `dark`: force dark mark for light backgrounds (useful when the source image is white)
   */
  variant?: "default" | "dark";
  image?: string;
};

export default function Logo({
  className,
  variant = "default",
  image,
}: LogoProps) {
  return (
    <div className={className}>
      <Image
        src={image || "/full-logo-dark.png"}
        alt="Sunrise Apartments"
        className={cn(
          "h-14 w-auto sm:h-16",
          variant === "dark" && "brightness-0",
        )}
        width={300}
        height={300}
      />
    </div>
  );
}
