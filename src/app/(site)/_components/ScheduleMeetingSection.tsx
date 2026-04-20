"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitContactInquiry } from "@/drizzle/queries/contact";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const PATIO_IMAGE =
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1400";

const TIME_OPTIONS = [
  { value: "weekday-morning", label: "Weekday — Morning (10am–12pm)" },
  { value: "weekday-afternoon", label: "Weekday — Afternoon (2pm–4pm)" },
  { value: "weekday-evening", label: "Weekday — Evening (5pm–7pm)" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
] as const;

const scheduleSchema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  phone: z.string().min(8, "Please enter a valid phone number."),
  email: z.string().email("Please enter a valid email address."),
  preferredTime: z.string().min(1, "Please select a time."),
});

type ScheduleForm = z.infer<typeof scheduleSchema>;

function timeLabel(value: string): string {
  return TIME_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export default function ScheduleMeetingSection() {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      preferredTime: "",
    },
  });

  const onSubmit = async (values: ScheduleForm) => {
    setSubmitting(true);
    try {
      const message = [
        "Schedule a meeting request (home page).",
        "",
        `Preferred time: ${timeLabel(values.preferredTime)}`,
      ].join("\n");

      await submitContactInquiry({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        message,
      });
      reset();
      toast.success("Thank you — we will contact you to confirm your meeting.");
    } catch {
      toast.error("Something went wrong. Please try again or call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "rounded-none border-foreground/80 bg-transparent shadow-none focus-visible:ring-foreground/30";

  return (
    <section
      id="schedule"
      className="relative border-t border-border/60 py-16 lg:py-24"
      aria-labelledby="schedule-meeting-heading"
    >
      <div className="absolute inset-0 bg-background" aria-hidden />

      <div
        className="absolute inset-0 bg-[url('/images/background.svg')] bg-cover bg-center bg-no-repeat opacity-[0.5] motion-reduce:opacity-[0.42]"
        aria-hidden
      />

      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-lg border border-border/70 bg-card shadow-lg">
          <div className="grid lg:grid-cols-2">
            <div className="relative min-h-[260px] bg-muted lg:min-h-[min(520px,60vh)]">
              <Image
                src={PATIO_IMAGE}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={false}
              />
            </div>

            <div className="flex flex-col justify-center bg-background p-8 lg:p-10 xl:p-12">
              <h2
                id="schedule-meeting-heading"
                className="mb-8 text-xl font-bold uppercase tracking-wide text-foreground sm:text-2xl"
              >
                Schedule a meeting
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="schedule-name" className="text-foreground">
                    Full name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="schedule-name"
                    autoComplete="name"
                    placeholder="Your name"
                    className={cn(fieldClass)}
                    aria-invalid={!!errors.name}
                    {...register("name")}
                  />
                  {errors.name ? (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="schedule-phone" className="text-foreground">
                    Phone number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="schedule-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+880 …"
                    className={cn(fieldClass)}
                    aria-invalid={!!errors.phone}
                    {...register("phone")}
                  />
                  {errors.phone ? (
                    <p className="text-xs text-destructive">{errors.phone.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="schedule-email" className="text-foreground">
                    Email address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="schedule-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={cn(fieldClass)}
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                  {errors.email ? (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="schedule-time" className="text-foreground">
                    Select a time <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="preferredTime"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="schedule-time"
                          className={cn(
                            "h-11 rounded-none border-foreground/80 bg-transparent shadow-none focus:ring-foreground/30",
                          )}
                          aria-invalid={!!errors.preferredTime}
                        >
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.preferredTime ? (
                    <p className="text-xs text-destructive">
                      {errors.preferredTime.message}
                    </p>
                  ) : null}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    variant="outline"
                    className="rounded-none border-foreground bg-background px-10 text-foreground hover:bg-muted/80"
                  >
                    {submitting ? "Submitting…" : "Submit"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
