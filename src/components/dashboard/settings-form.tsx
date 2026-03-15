"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2Icon, PlusIcon, Trash2Icon, LinkIcon, MailIcon, MessageCircleIcon, ImageIcon, UploadIcon } from "lucide-react";
import { SETTING_KEYS, type HomeSliderSlide } from "@/lib/settings-keys";
import { getCdnImageUrl } from "@/lib/utils";
import { SearchLocationInput } from "@/components/SearchLocationInput";

const LocationMap = dynamic(
  () =>
    import("@/components/LocationMap").then((m) => ({
      default: m.default,
    })),
  { ssr: false },
);

type SettingsMap = Record<string, string>;

function parseHomeSlider(value: string): HomeSliderSlide[] {
  if (!value || value.trim() === "") return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseStringArray(value: string): string[] {
  if (!value || value.trim() === "") return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map((x) => String(x ?? "")) : [];
  } catch {
    return [];
  }
}

export function SettingsForm({ initialSettings }: { initialSettings: SettingsMap }) {
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsMap>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const get = (key: string) => settings[key] ?? "";

  const set = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  async function save(payload: Record<string, string | object>) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to save");
      }
      const updated = await res.json();
      setSettings(updated);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  // Contact phones/emails (repeatable); init from contact_phones/contact_emails or legacy keys
  const getInitialPhones = () => {
    const stored = get(SETTING_KEYS.contact_phones);
    if (stored && stored.trim() !== "") return parseStringArray(stored);
    const legacy = [get(SETTING_KEYS.phone_1), get(SETTING_KEYS.phone_2)].filter(Boolean);
    return legacy.length > 0 ? legacy : [""];
  };
  const getInitialEmails = () => {
    const stored = get(SETTING_KEYS.contact_emails);
    if (stored && stored.trim() !== "") return parseStringArray(stored);
    const legacy = [get(SETTING_KEYS.email_sales), get(SETTING_KEYS.email_info)].filter(Boolean);
    return legacy.length > 0 ? legacy : [""];
  };
  const [contactPhones, setContactPhones] = useState<string[]>(getInitialPhones);
  const [contactEmails, setContactEmails] = useState<string[]>(getInitialEmails);

  useEffect(() => {
    const g = (k: string) => settings[k] ?? "";
    const phonesStored = g(SETTING_KEYS.contact_phones);
    const phones = phonesStored.trim()
      ? parseStringArray(phonesStored)
      : [g(SETTING_KEYS.phone_1), g(SETTING_KEYS.phone_2)].filter(Boolean);
    setContactPhones(phones.length > 0 ? phones : [""]);
    const emailsStored = g(SETTING_KEYS.contact_emails);
    const emails = emailsStored.trim()
      ? parseStringArray(emailsStored)
      : [g(SETTING_KEYS.email_sales), g(SETTING_KEYS.email_info)].filter(Boolean);
    setContactEmails(emails.length > 0 ? emails : [""]);
  }, [settings]);

  // Home slider state (local copy for editing)
  const homeSliderValue = settings[SETTING_KEYS.home_slider] ?? "";
  const [sliderSlides, setSliderSlides] = useState<HomeSliderSlide[]>(() =>
    parseHomeSlider(homeSliderValue)
  );

  useEffect(() => {
    setSliderSlides(parseHomeSlider(homeSliderValue));
  }, [homeSliderValue]);

  const updateSlide = (index: number, field: keyof HomeSliderSlide, value: string) => {
    setSliderSlides((prev) => {
      const next = [...prev];
      if (!next[index]) return prev;
      next[index] = { ...next[index], [field]: value || undefined };
      return next;
    });
  };

  const addSlide = () => setSliderSlides((prev) => [...prev, { imageKey: "" }]);
  const removeSlide = (index: number) =>
    setSliderSlides((prev) => prev.filter((_, i) => i !== index));

  const saveHomeSlider = () => {
    save({ [SETTING_KEYS.home_slider]: sliderSlides });
  };

  const sliderUploadRef = useRef<HTMLInputElement>(null);
  const sliderUploadIndexRef = useRef<number>(0);
  const [uploadingSlideIndex, setUploadingSlideIndex] = useState<number | null>(null);
  const [sliderUploadError, setSliderUploadError] = useState<string | null>(null);

  function triggerSliderUpload(index: number) {
    setSliderUploadError(null);
    sliderUploadIndexRef.current = index;
    setUploadingSlideIndex(index);
    sliderUploadRef.current?.click();
  }

  async function handleSliderImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) {
      setSliderUploadError("Please select an image file.");
      setUploadingSlideIndex(null);
      return;
    }
    const index = sliderUploadIndexRef.current;
    setSliderUploadError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("prefix", "hero");
      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Upload failed");
      }
      const { key } = await res.json();
      updateSlide(index, "imageKey", key);
    } catch (err) {
      setSliderUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingSlideIndex(null);
    }
  }

  const updatePhone = (index: number, value: string) => {
    setContactPhones((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };
  const addPhone = () => setContactPhones((prev) => [...prev, ""]);
  const removePhone = (index: number) =>
    setContactPhones((prev) => prev.filter((_, i) => i !== index));

  const updateEmail = (index: number, value: string) => {
    setContactEmails((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };
  const addEmail = () => setContactEmails((prev) => [...prev, ""]);
  const removeEmail = (index: number) =>
    setContactEmails((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Tabs defaultValue="social" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="social" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Social links</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <MailIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Contact info</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <MessageCircleIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Support chat</span>
          </TabsTrigger>
          <TabsTrigger value="slider" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Home slider</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Social links</CardTitle>
              <CardDescription>URLs for social media profiles. Leave blank to hide.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: SETTING_KEYS.social_facebook, label: "Facebook" },
                { key: SETTING_KEYS.social_twitter, label: "Twitter / X" },
                { key: SETTING_KEYS.social_instagram, label: "Instagram" },
                { key: SETTING_KEYS.social_linkedin, label: "LinkedIn" },
                { key: SETTING_KEYS.social_youtube, label: "YouTube" },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    type="url"
                    placeholder="https://..."
                    value={get(key)}
                    onChange={(e) => set(key, e.target.value)}
                    disabled={saving}
                  />
                </div>
              ))}
              <Button
                onClick={() =>
                  save({
                    [SETTING_KEYS.social_facebook]: get(SETTING_KEYS.social_facebook),
                    [SETTING_KEYS.social_twitter]: get(SETTING_KEYS.social_twitter),
                    [SETTING_KEYS.social_instagram]: get(SETTING_KEYS.social_instagram),
                    [SETTING_KEYS.social_linkedin]: get(SETTING_KEYS.social_linkedin),
                    [SETTING_KEYS.social_youtube]: get(SETTING_KEYS.social_youtube),
                  })
                }
                disabled={saving}
              >
                {saving ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save social links
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact info</CardTitle>
              <CardDescription>Address, phone numbers, and emails used site-wide (e.g. footer). Add or remove entries as needed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor={SETTING_KEYS.company_name}>Company name</Label>
                <Input
                  id={SETTING_KEYS.company_name}
                  value={get(SETTING_KEYS.company_name)}
                  onChange={(e) => set(SETTING_KEYS.company_name, e.target.value)}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Search for a place or drag the map pin to set the office location. Enter or edit the full address below.
                </p>
                <SearchLocationInput
                  value={get(SETTING_KEYS.address)}
                  placeholder="Search for a place or address..."
                  disabled={saving}
                  onSelect={(details) => {
                    set(SETTING_KEYS.address_lat, String(details.lat));
                    set(SETTING_KEYS.address_lng, String(details.lng));
                    set(SETTING_KEYS.address, details.formattedAddress);
                  }}
                />
                <LocationMap
                  pins={
                    get(SETTING_KEYS.address_lat) && get(SETTING_KEYS.address_lng)
                      ? [
                          {
                            lat: Number.parseFloat(get(SETTING_KEYS.address_lat)),
                            lng: Number.parseFloat(get(SETTING_KEYS.address_lng)),
                          },
                        ]
                      : undefined
                  }
                  onPinDragEnd={(pin) => {
                    set(SETTING_KEYS.address_lat, String(pin.lat));
                    set(SETTING_KEYS.address_lng, String(pin.lng));
                  }}
                  height={320}
                />
                <div className="pt-2">
                  <Label htmlFor={SETTING_KEYS.address}>Full address</Label>
                  <Input
                    id={SETTING_KEYS.address}
                    value={get(SETTING_KEYS.address)}
                    onChange={(e) => set(SETTING_KEYS.address, e.target.value)}
                    disabled={saving}
                    placeholder="Full address (from search or type manually)"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Phone numbers</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPhone}
                    disabled={saving}
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add phone
                  </Button>
                </div>
                {contactPhones.map((phone, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      type="tel"
                      placeholder="+8801713841977"
                      value={phone}
                      onChange={(e) => updatePhone(index, e.target.value)}
                      disabled={saving}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePhone(index)}
                      disabled={saving || contactPhones.length <= 1}
                      aria-label="Remove phone"
                    >
                      <Trash2Icon className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">Include country code, no spaces.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Email addresses</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEmail}
                    disabled={saving}
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add email
                  </Button>
                </div>
                {contactEmails.map((email, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      type="email"
                      placeholder="info@example.com"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      disabled={saving}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEmail(index)}
                      disabled={saving || contactEmails.length <= 1}
                      aria-label="Remove email"
                    >
                      <Trash2Icon className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                onClick={() =>
                  save({
                    [SETTING_KEYS.company_name]: get(SETTING_KEYS.company_name),
                    [SETTING_KEYS.address]: get(SETTING_KEYS.address),
                    [SETTING_KEYS.address_lat]: get(SETTING_KEYS.address_lat),
                    [SETTING_KEYS.address_lng]: get(SETTING_KEYS.address_lng),
                    [SETTING_KEYS.contact_phones]: contactPhones,
                    [SETTING_KEYS.contact_emails]: contactEmails,
                  })
                }
                disabled={saving}
              >
                {saving ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save contact info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Support chat</CardTitle>
              <CardDescription>Messenger and WhatsApp for support / contact.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={SETTING_KEYS.messenger_link}>Messenger link</Label>
                <Input
                  id={SETTING_KEYS.messenger_link}
                  type="url"
                  placeholder="https://m.me/yourpage"
                  value={get(SETTING_KEYS.messenger_link)}
                  onChange={(e) => set(SETTING_KEYS.messenger_link, e.target.value)}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={SETTING_KEYS.whatsapp_number}>WhatsApp number</Label>
                <Input
                  id={SETTING_KEYS.whatsapp_number}
                  type="tel"
                  placeholder="+8801713841977"
                  value={get(SETTING_KEYS.whatsapp_number)}
                  onChange={(e) => set(SETTING_KEYS.whatsapp_number, e.target.value)}
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">Include country code, no spaces (e.g. +8801713841977).</p>
              </div>
              <Button
                onClick={() =>
                  save({
                    [SETTING_KEYS.messenger_link]: get(SETTING_KEYS.messenger_link),
                    [SETTING_KEYS.whatsapp_number]: get(SETTING_KEYS.whatsapp_number),
                  })
                }
                disabled={saving}
              >
                {saving ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save support chat
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slider" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Home slider</CardTitle>
              <CardDescription>Slides for the homepage hero carousel. Upload an image or enter the image key.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={sliderUploadRef}
                type="file"
                accept="image/*"
                className="hidden"
                aria-hidden
                disabled={saving || uploadingSlideIndex !== null}
                onChange={handleSliderImageUpload}
              />
              {sliderUploadError && (
                <p className="text-sm text-destructive">{sliderUploadError}</p>
              )}
              {sliderSlides.map((slide, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Slide {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSlide(index)}
                      disabled={saving}
                      aria-label="Remove slide"
                    >
                      <Trash2Icon className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Slide image</Label>
                      {slide.imageKey && getCdnImageUrl(slide.imageKey) ? (
                        <div className="flex flex-col gap-2">
                          <div className="relative w-full max-w-xs aspect-video rounded-md border overflow-hidden bg-muted">
                            <img
                              src={getCdnImageUrl(slide.imageKey)!}
                              alt={slide.title ?? `Slide ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => triggerSliderUpload(index)}
                              disabled={saving || uploadingSlideIndex !== null}
                            >
                              {uploadingSlideIndex === index ? (
                                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <UploadIcon className="mr-2 h-4 w-4" />
                              )}
                              Replace image
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => updateSlide(index, "imageKey", "")}
                              disabled={saving}
                              className="text-destructive hover:text-destructive"
                            >
                              Remove image
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => triggerSliderUpload(index)}
                            disabled={saving || uploadingSlideIndex !== null}
                          >
                            {uploadingSlideIndex === index ? (
                              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <UploadIcon className="mr-2 h-4 w-4" />
                            )}
                            Upload image
                          </Button>
                          <span className="text-xs text-muted-foreground">or enter key below</span>
                        </div>
                      )}
                      <Input
                        placeholder="hero/slide-1.jpg (or use upload)"
                        value={slide.imageKey}
                        onChange={(e) => updateSlide(index, "imageKey", e.target.value)}
                        disabled={saving}
                        className="mt-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        placeholder="Optional title"
                        value={slide.title ?? ""}
                        onChange={(e) => updateSlide(index, "title", e.target.value)}
                        disabled={saving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Link URL</Label>
                      <Input
                        type="url"
                        placeholder="Optional link"
                        value={slide.link ?? ""}
                        onChange={(e) => updateSlide(index, "link", e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addSlide}
                disabled={saving}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add slide
              </Button>
              <div className="pt-2">
                <Button onClick={saveHomeSlider} disabled={saving}>
                  {saving ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save home slider
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
