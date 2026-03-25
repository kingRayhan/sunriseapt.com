const HTML_TAG = /<[^>]*>/g;

/** Public site name used in titles and Open Graph. */
export const SITE_NAME = "Sunriseapt";

/** Default meta description for the public site. */
export const DEFAULT_DESCRIPTION =
  "Sunrise Apartments ltd is a Real Estate company that creates living spaces that seamlessly blend luxury and nature. We believe that everyone deserves to live in a beautiful, sustainable environment, and we are committed to creating apartments that are both stylish and eco-friendly.";

/**
 * Canonical origin for metadata (Open Graph, canonical URLs).
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://sunriseapt.com).
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }
  return "http://localhost:3000";
}

export function truncateMetaDescription(
  value: string | null | undefined,
  max = 160,
  fallback = "",
): string {
  if (!value?.trim()) return fallback;
  const plain = value.replace(HTML_TAG, " ").replace(/\s+/g, " ").trim();
  if (!plain) return fallback;
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1).trimEnd()}…`;
}
