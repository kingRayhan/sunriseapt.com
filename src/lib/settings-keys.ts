/**
 * Setting keys stored in site_settings (key-value).
 * Values are always strings; home_slider is JSON string.
 */
export const SETTING_KEYS = {
  // Contact info (also in seed)
  company_name: "company_name",
  address: "address",
  /** Optional lat/lng for address map pin (e.g. office location). */
  address_lat: "address_lat",
  address_lng: "address_lng",
  /** JSON array of phone strings. Use this for repeatable phones. */
  contact_phones: "contact_phones",
  /** JSON array of email strings. Use this for repeatable emails. */
  contact_emails: "contact_emails",
  // Legacy keys (used when migrating from old data)
  phone_1: "phone_1",
  phone_2: "phone_2",
  email_sales: "email_sales",
  email_info: "email_info",
  logo_key: "logo_key",

  // Social links
  social_facebook: "social_facebook",
  social_twitter: "social_twitter",
  social_instagram: "social_instagram",
  social_linkedin: "social_linkedin",
  social_youtube: "social_youtube",

  // Support chat
  messenger_link: "messenger_link",
  whatsapp_number: "whatsapp_number",

  // Home slider: JSON array of { imageKey: string, title?: string, subtitle?: string, link?: string }
  home_slider: "home_slider",
} as const;

export type HomeSliderSlide = {
  imageKey: string;
  title?: string;
  /** For site-2 hero: short description under the heading. */
  description?: string;
  /** Accessibility: describe the image when it conveys meaning. */
  alt?: string;
  link?: string;
};

export const DEFAULT_HOME_SLIDER: HomeSliderSlide[] = [];
