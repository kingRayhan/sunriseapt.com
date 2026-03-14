import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatArea(area: number | string): string {
  const num = typeof area === "string" ? parseFloat(area) : area;
  if (Number.isNaN(num)) return "";
  return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/** Base URL for CDN (e.g. https://cdn.sunriseapt.com). Set via NEXT_PUBLIC_CDN_URL. */
export function getCdnBaseUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_CDN_URL;
  if (!base || typeof base !== "string") return null;
  return base.replace(/\/$/, "");
}

/** Full URL for an image stored by key. Returns null if CDN base is not set. */
export function getCdnImageUrl(key: string): string | null {
  const base = getCdnBaseUrl();
  if (!base || !key) return null;
  return `${base}/${key.replace(/^\//, "")}`;
}
