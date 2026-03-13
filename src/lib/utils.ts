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
