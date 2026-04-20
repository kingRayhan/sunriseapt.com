import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SupportChatPopup } from "@/components/SupportChatPopup";
import { getSiteSettings } from "@/drizzle/queries/settings";
import { SETTING_KEYS } from "@/lib/settings-keys";

// Force static generation + ISR for all public site pages (not dashboard)
export const dynamic = "force-static";
export const revalidate = 60;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const messengerLink = settings[SETTING_KEYS.messenger_link] ?? null;
  const whatsappNumber = settings[SETTING_KEYS.whatsapp_number] ?? null;
  const socialLinks = {
    facebook: settings[SETTING_KEYS.social_facebook]?.trim() || null,
    twitter: settings[SETTING_KEYS.social_twitter]?.trim() || null,
    instagram: settings[SETTING_KEYS.social_instagram]?.trim() || null,
    linkedin: settings[SETTING_KEYS.social_linkedin]?.trim() || null,
    youtube: settings[SETTING_KEYS.social_youtube]?.trim() || null,
  };

  const contactPhonesRaw = settings[SETTING_KEYS.contact_phones]?.trim();
  const contactEmailsRaw = settings[SETTING_KEYS.contact_emails]?.trim();
  const contactPhones: string[] = contactPhonesRaw
    ? (() => {
        try {
          const parsed = JSON.parse(contactPhonesRaw) as unknown;
          return Array.isArray(parsed)
            ? parsed.map((x) => String(x ?? "").trim()).filter(Boolean)
            : [];
        } catch {
          return [];
        }
      })()
    : [];
  const contactEmails: string[] = contactEmailsRaw
    ? (() => {
        try {
          const parsed = JSON.parse(contactEmailsRaw) as unknown;
          return Array.isArray(parsed)
            ? parsed.map((x) => String(x ?? "").trim()).filter(Boolean)
            : [];
        } catch {
          return [];
        }
      })()
    : [];

  const contactInfo = {
    companyName: settings[SETTING_KEYS.company_name]?.trim() || null,
    address: settings[SETTING_KEYS.address]?.trim() || null,
    phones: contactPhones,
    emails: contactEmails,
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      {children}
      <Footer socialLinks={socialLinks} contactInfo={contactInfo} />
      <SupportChatPopup
        messengerLink={messengerLink || undefined}
        whatsappNumber={whatsappNumber || undefined}
      />
    </div>
  );
}
