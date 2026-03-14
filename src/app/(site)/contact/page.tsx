import { getSiteSettings } from "@/drizzle/queries/settings";
import { SETTING_KEYS } from "@/lib/settings-keys";
import { ContactPageContent } from "./ContactPageContent";

function parseStringArray(value: string): string[] {
  if (!value?.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.map((x) => String(x ?? "").trim()).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

export const revalidate = 60;

export default async function ContactPage() {
  const settings = await getSiteSettings();
  // Address and map coordinates from settings (Dashboard → Settings → Contact info)
  const address = settings[SETTING_KEYS.address]?.trim() || null;
  const contactPhones = parseStringArray(
    settings[SETTING_KEYS.contact_phones] ?? "",
  );
  const contactEmails = parseStringArray(
    settings[SETTING_KEYS.contact_emails] ?? "",
  );
  const latRaw = settings[SETTING_KEYS.address_lat]?.trim();
  const lngRaw = settings[SETTING_KEYS.address_lng]?.trim();
  const lat = latRaw ? Number.parseFloat(latRaw) : NaN;
  const lng = lngRaw ? Number.parseFloat(lngRaw) : NaN;
  const hasValidLocation =
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);

  const contactInfo = {
    address,
    phones: contactPhones,
    emails: contactEmails,
  };

  const mapLocation: {
    lat: number;
    lng: number;
    address: string | null;
  } | null = hasValidLocation ? { lat, lng, address } : null;

  return (
    <ContactPageContent contactInfo={contactInfo} mapLocation={mapLocation} />
  );
}
