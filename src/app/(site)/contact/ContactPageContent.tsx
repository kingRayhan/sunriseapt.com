"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { submitContactInquiry } from "@/drizzle/queries/contact";

const LocationMap = dynamic(
  () =>
    import("@/components/LocationMap").then((m) => ({ default: m.default })),
  { ssr: false },
);

const contactFormSchema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

export type ContactInfo = {
  address: string | null;
  phones: string[];
  emails: string[];
};

export type MapLocation = {
  lat: number;
  lng: number;
  address: string | null;
};

type ContactPageContentProps = {
  contactInfo: ContactInfo;
  mapLocation: MapLocation | null;
};

export function ContactPageContent({
  contactInfo,
  mapLocation,
}: ContactPageContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof contactFormSchema>) => {
    setIsSubmitting(true);
    setSubmitState("idle");
    setSubmitError(null);
    try {
      await submitContactInquiry({
        email: values.email,
        message: values.message,
        name: values.name,
        phone: values.phone,
      });
      reset();
      setSubmitState("success");
    } catch {
      setSubmitState("error");
      setSubmitError("Something went wrong. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasContactInfo =
    contactInfo.address ||
    contactInfo.phones.length > 0 ||
    contactInfo.emails.length > 0;

  return (
    <section
      className="border-t border-border/60 bg-background py-16 lg:py-24"
      aria-labelledby="contact-heading"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-10 flex flex-col gap-3 lg:mb-12">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Reach out
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2
              id="contact-heading"
              className="text-balance text-3xl font-bold uppercase tracking-tight text-primary sm:text-4xl"
            >
              Talk to our team
            </h2>
            <p className="text-pretty text-sm text-muted-foreground">
              Share what you&apos;re looking for and we&apos;ll follow up shortly.
            </p>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <Card className="rounded-sm border-border/60">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-lg font-bold uppercase text-foreground sm:text-xl">
                Send a message
              </h3>
              <p className="mt-2 text-pretty text-sm text-muted-foreground">
                We typically respond within 1 business day.
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-8 space-y-5"
              >
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    aria-invalid={!!errors.name}
                    className="mt-1.5"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                    className="mt-1.5"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    {...register("phone")}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    {...register("message")}
                    aria-invalid={!!errors.message}
                    rows={6}
                    className="mt-1.5"
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {submitState === "success" ? (
                  <p className="rounded-sm border border-border/60 bg-muted/20 p-3 text-sm text-foreground">
                    Thanks — your message has been sent.
                  </p>
                ) : null}

                {submitState === "error" ? (
                  <p className="rounded-sm border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {submitError}
                  </p>
                ) : null}

                <Button type="submit" size="lg" disabled={isSubmitting}>
                  <Send className="mr-2 h-4 w-4" aria-hidden />
                  {isSubmitting ? "Sending..." : "Send message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold uppercase text-foreground sm:text-xl">
                Contact details
              </h3>
              <p className="mt-2 text-pretty text-sm text-muted-foreground">
                Prefer to call or visit? Here&apos;s how to reach us.
              </p>
            </div>

            {hasContactInfo && (
              <div className="space-y-4">
                {contactInfo.address ? (
                  <Card className="rounded-sm border-border/60">
                    <CardContent className="flex items-start gap-4 p-6">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" aria-hidden />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase text-muted-foreground">
                          Office address
                        </p>
                        <p className="text-pretty text-sm text-foreground whitespace-pre-line">
                          {contactInfo.address}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {contactInfo.phones.length > 0 ? (
                  <Card className="rounded-sm border-border/60">
                    <CardContent className="flex items-start gap-4 p-6">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Phone className="h-5 w-5 text-primary" aria-hidden />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase text-muted-foreground">
                          Phone
                        </p>
                        <p className="text-pretty text-sm text-foreground whitespace-pre-line">
                          {contactInfo.phones.join("\n")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {contactInfo.emails.length > 0 ? (
                  <Card className="rounded-sm border-border/60">
                    <CardContent className="flex items-start gap-4 p-6">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Mail className="h-5 w-5 text-primary" aria-hidden />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase text-muted-foreground">
                          Email
                        </p>
                        <p className="text-pretty text-sm text-foreground whitespace-pre-line">
                          {contactInfo.emails.join("\n")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            )}

            {mapLocation ? (
              <div className="pt-2">
                <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Location
                </h4>
                <div className="mt-3 overflow-hidden rounded-sm border border-border/60">
                  <LocationMap
                    pins={[{ lat: mapLocation.lat, lng: mapLocation.lng }]}
                    height={300}
                  />
                </div>
                <a
                  href={`https://www.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex text-sm font-medium text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary/90"
                >
                  Open in Google Maps
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
