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
  () => import("@/components/LocationMap").then((m) => ({ default: m.LocationMap })),
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
    try {
      await submitContactInquiry({
        email: values.email,
        message: values.message,
        name: values.name,
        phone: values.phone,
      });
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasContactInfo =
    contactInfo.address ||
    contactInfo.phones.length > 0 ||
    contactInfo.emails.length > 0;

  return (
    <div className="pt-20">
      <div className="bg-primary text-primary-foreground py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-primary-foreground/70">
            We&apos;d love to hear from you
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="name">Full Name</Label>
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
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
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
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
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
                  rows={5}
                  className="mt-1.5"
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.message.message}
                  </p>
                )}
              </div>
              <Button type="submit" size="lg" disabled={isSubmitting}>
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>

            {hasContactInfo && (
              <div className="space-y-4">
                {contactInfo.address && (
                  <Card className="border-border">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          Office Address
                        </p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {contactInfo.address}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {contactInfo.phones.length > 0 && (
                  <Card className="border-border">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          Phone
                        </p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {contactInfo.phones.join("\n")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {contactInfo.emails.length > 0 && (
                  <Card className="border-border">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          Email
                        </p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {contactInfo.emails.join("\n")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {mapLocation && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Our Location</h3>
                <LocationMap
                  points={{ lat: mapLocation.lat, lng: mapLocation.lng }}
                  location={mapLocation.address}
                />
                {mapLocation.address && (
                  <a
                    href={`https://www.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm text-primary hover:underline"
                  >
                    Open in Google Maps →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
