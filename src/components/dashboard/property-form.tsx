"use client";

import { GalleryImagePreview } from "@/components/dashboard/gallery-image-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Property } from "@/drizzle";
import type { ProjectDetail } from "@/drizzle/schema";
import { useStorage } from "@/hooks/use-storage";
import { toast } from "@/hooks/use-toast";
import { getCdnImageUrl } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  FileImageIcon,
  FileTextIcon,
  LayoutGridIcon,
  Loader2Icon,
  MapPinIcon,
  UploadIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import LocationMap from "../LocationMap";
import { SearchLocationInput } from "../SearchLocationInput";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const propertyFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  location: z.string().optional(),
  description: z.string().optional(),
  price: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  bedrooms: z.coerce.number().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  area: z.string().optional(),
  yearBuilt: z.string().optional(),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  imagesStr: z.string().optional(),
  featuresStr: z.string().optional(),
  brochureKey: z.string().optional(),

  // Fixed project detail fields
  projectName: z.string().optional(),
  orientation: z.string().optional(),
  frontRoad: z.string().optional(),
  landSize: z.string().optional(),
  apartmentSize: z.string().optional(),
  numberOfUnit: z.string().optional(),
  numberOfFloor: z.string().optional(),
  apartmentContain: z.string().optional(),
  developer: z.string().optional(),
});

const PROJECT_DETAIL_FIELDS = [
  { key: "projectName" as const, label: "Project Name" },
  { key: "orientation" as const, label: "Orientation" },
  { key: "frontRoad" as const, label: "Front Road" },
  { key: "landSize" as const, label: "Land size" },
  { key: "apartmentSize" as const, label: "Apartment Size" },
  { key: "numberOfUnit" as const, label: "Number of Unit" },
  { key: "numberOfFloor" as const, label: "Number of Floor" },
  { key: "apartmentContain" as const, label: "Apartment Contain" },
  { key: "developer" as const, label: "Developer" },
] as const;

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

const DHAKA_AREAS = [
  "Uttara",
  "Dhanmondi",
  "Banani",
  "Gulshan",
  "Bashundhara",
  "Mirpur",
  "Mohammadpur",
  "Badda",
  "Khilgaon",
  "Malibagh",
  "Rampura",
  "Tejgaon",
  "Motijheel",
  "Old Dhaka",
  "Pallabi",
  "Kafrul",
  "Baridhara",
  "Niketon",
  "Khilkhet",
  "Airport",
] as const;

export function isPresetDhakaArea(location?: string): boolean {
  const trimmedLocation = (location ?? "").trim();
  return DHAKA_AREAS.includes(
    trimmedLocation as (typeof DHAKA_AREAS)[number],
  );
}

function getDefaultValues(property?: Property | null): PropertyFormValues {
  return {
    title: property?.title ?? "",
    slug: property?.slug ?? "",
    location: property?.location ?? "",
    description: property?.description ?? "",
    price: property?.price ?? "0",
    type: property?.type ?? "apartment",
    status: property?.status ?? "available",
    bedrooms: property?.bedrooms ?? 0,
    bathrooms: property?.bathrooms ?? 0,
    area: property?.area ?? "0",
    yearBuilt: property?.yearBuilt != null ? String(property.yearBuilt) : "",
    address: property?.address ?? "",
    lat: property?.lat ?? undefined,
    lng: property?.lng ?? undefined,
    featured: property?.featured ?? false,
    published: property?.published ?? true,
    imagesStr: Array.isArray(property?.images)
      ? property.images.join(", ")
      : "",
    featuresStr: Array.isArray(property?.features)
      ? property.features.join(", ")
      : "",
    brochureKey: property?.brochureKey ?? "",
    ...getProjectDetailsDefaults(property?.projectDetails),
  };
}

function getProjectDetailsDefaults(
  projectDetails?: Array<{ label?: string; value?: string }> | null,
): Record<string, string> {
  const map = new Map<string, string>();
  if (Array.isArray(projectDetails)) {
    for (const item of projectDetails) {
      if (item?.label != null && item?.value != null) {
        map.set(String(item.label).trim(), String(item.value).trim());
      }
    }
  }
  const out: Record<string, string> = {};
  for (const { key, label } of PROJECT_DETAIL_FIELDS) {
    out[key] = map.get(label) ?? "";
  }
  return out;
}

interface PropertyFormProps {
  property?: Property | null;
}

export function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter();
  const isEdit = !!property;
  const {
    uploadFiles,
    loading: storageLoading,
    error: storageError,
  } = useStorage();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: getDefaultValues(property),
    mode: "onSubmit",
  });

  const {
    formState: { errors },
  } = form;

  const saveMutation = useMutation({
    mutationFn: async (values: PropertyFormValues) => {
      const projectDetails: ProjectDetail[] = PROJECT_DETAIL_FIELDS.map(
        ({ label, key }) => ({
          label,
          value: (values[key] ?? "").trim(),
        }),
      );
      const body = {
        title: values.title.trim(),
        slug: values.slug.trim() || slugify(values.title),
        location: values.location?.trim() || null,
        description: values.description?.trim() || null,
        price: values.price?.trim() || "0",
        type: values.type?.trim() || "apartment",
        status: values.status?.trim() || "available",
        bedrooms: values.bedrooms ?? 0,
        bathrooms: values.bathrooms ?? 0,
        area: values.area?.trim() || "0",
        yearBuilt: values.yearBuilt?.trim()
          ? parseInt(values.yearBuilt, 10)
          : undefined,
        address: values.address?.trim() || null,
        lat:
          values.lat != null && !Number.isNaN(values.lat)
            ? values.lat
            : undefined,
        lng:
          values.lng != null && !Number.isNaN(values.lng)
            ? values.lng
            : undefined,
        featured: values.featured ?? false,
        published: values.published ?? true,
        images: (values.imagesStr ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        features: (values.featuresStr ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        projectDetails,
        brochureKey: values.brochureKey?.trim() || null,
      };
      const url = isEdit
        ? `/api/dashboard/properties/${property.id}`
        : "/api/dashboard/properties";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Request failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Property saved successfully",
        description: "Your property has been saved successfully",
      });
      router.refresh();
    },
  });

  const onSubmit = form.handleSubmit(
    (values) => saveMutation.mutate(values),
    (err) => {
      const firstError = Object.keys(err)[0];
      if (firstError) {
        document
          .querySelector(`[name="${firstError}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
  );

  function syncSlugFromTitle() {
    const title = form.getValues("title");
    const slug = form.getValues("slug");
    if (!slug || slug === slugify(property?.title ?? "")) {
      form.setValue("slug", slugify(title));
    }
  }

  async function handleBrochureUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast({
        title: "Error",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
      return;
    }
    try {
      const MAX_PDF_SIZE_MB = 20;
      const [result] = await uploadFiles([file], "brochures", {
        maxFileSizeMb: MAX_PDF_SIZE_MB,
      });
      form.setValue("brochureKey", result.key);
    } catch {
      toast({
        title: "Upload failed",
        description: storageError?.message ?? "Failed to upload brochure.",
        variant: "destructive",
      });
    }
    e.target.value = "";
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (!imageFiles.length) return;
    try {
      const results = await uploadFiles(imageFiles, "gallery");
      const keys = results.map((r) => r.key);
      const current = form.getValues("imagesStr") ?? "";
      const existing = current
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      form.setValue("imagesStr", [...existing, ...keys].join(", "));
    } catch {
      toast({
        title: "Upload failed",
        description: storageError?.message ?? "Failed to upload images.",
        variant: "destructive",
      });
    }
    e.target.value = "";
  }

  const imagesStr = form.watch("imagesStr") ?? "";
  const imageKeysList = imagesStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  function removeImageKey(keyToRemove: string) {
    form.setValue(
      "imagesStr",
      imageKeysList.filter((k) => k !== keyToRemove).join(", "),
    );
  }

  const saving = saveMutation.isPending;

  const inputClassName =
    "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <form
      id="property-form"
      onSubmit={onSubmit}
      className="flex min-h-[calc(100vh-var(--header-height,5rem))] flex-col"
    >
      <div className="flex-1 space-y-8 pb-[calc(var(--header-height,5rem)+6rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button type="button" variant="ghost" size="icon" asChild>
              <Link href="/dashboard/properties">
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit ? "Edit Property" : "New Property"}
            </h1>
          </div>
        </div>

        {saveMutation.isError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {saveMutation.error instanceof Error
              ? saveMutation.error.message
              : "Something went wrong"}
          </div>
        )}

        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LayoutGridIcon className="h-5 w-5" />
              Basic info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="property-form-title">
                      Title *
                    </FieldLabel>
                    <Input
                      id="property-form-title"
                      {...field}
                      onBlur={() => {
                        field.onBlur();
                        syncSlugFromTitle();
                      }}
                      disabled={saving}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="slug"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="property-form-slug">Slug *</FieldLabel>
                    <Input
                      id="property-form-slug"
                      {...field}
                      disabled={saving}
                      placeholder="url-friendly-name"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      URL-friendly identifier. Auto-generated from title if left
                      blank.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <Controller
              name="location"
              control={form.control}
              render={({ field, fieldState }) => {
                const presetMatch = isPresetDhakaArea(field.value);
                const selectValue =
                  field.value && presetMatch ? field.value : "__other__";

                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="property-form-location">
                      Area (Dhaka)
                    </FieldLabel>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Select
                        value={selectValue}
                        onValueChange={(v) => {
                          if (v === "__other__") {
                            if (presetMatch) field.onChange("");
                            return;
                          }
                          field.onChange(v);
                        }}
                        disabled={saving}
                      >
                        <SelectTrigger id="property-form-location">
                          <SelectValue placeholder="Select area" />
                        </SelectTrigger>
                        <SelectContent>
                          {DHAKA_AREAS.map((a) => (
                            <SelectItem key={a} value={a}>
                              {a}
                            </SelectItem>
                          ))}
                          <SelectItem value="__other__">Other</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        value={presetMatch ? "" : (field.value ?? "")}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={saving}
                        placeholder="Other area (type here)"
                        aria-invalid={fieldState.invalid}
                      />
                    </div>
                    <FieldDescription>
                      Used on the website listing cards (e.g. “Uttara”, “Banani”).
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                );
              }}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="property-form-description">
                    Description
                  </FieldLabel>
                  <textarea
                    id="property-form-description"
                    {...field}
                    disabled={saving}
                    rows={4}
                    className={inputClassName}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Full property description for the listing page.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </CardContent>
        </Card>

        {/* Listing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Listing</CardTitle>
            <p className="text-sm text-muted-foreground">
              Type, status, price and visibility
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Controller
                name="type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="property-form-type">Type</FieldLabel>
                    <Select
                      name={field.name}
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={saving}
                    >
                      <SelectTrigger
                        id="property-form-type"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="penthouse">Penthouse</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="status"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="property-form-status">
                      Status
                    </FieldLabel>
                    <Select
                      name={field.name}
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={saving}
                    >
                      <SelectTrigger
                        id="property-form-status"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="price"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="property-form-price">Price</FieldLabel>
                    <Input
                      id="property-form-price"
                      {...field}
                      type="text"
                      inputMode="decimal"
                      disabled={saving}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="featured"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Featured</FieldLabel>
                    <div className="flex h-10 items-center pt-2">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={saving}
                        aria-invalid={fieldState.invalid}
                      />
                      <label className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Show on homepage
                      </label>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="published"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Published</FieldLabel>
                    <div className="flex h-10 items-center pt-2">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={saving}
                        aria-invalid={fieldState.invalid}
                      />
                      <label className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Show on website
                      </label>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Specifications</CardTitle>
            <p className="text-sm text-muted-foreground">
              Beds, baths, area and year built
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Controller
                name="bedrooms"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="property-form-bedrooms">
                      Bedrooms
                    </FieldLabel>
                    <Input
                      id="property-form-bedrooms"
                      type="number"
                      min={0}
                      disabled={saving}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value, 10) : 0,
                        )
                      }
                      onBlur={field.onBlur}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="bathrooms"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="property-form-bathrooms">
                      Bathrooms
                    </FieldLabel>
                    <Input
                      id="property-form-bathrooms"
                      type="number"
                      min={0}
                      disabled={saving}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value, 10) : 0,
                        )
                      }
                      onBlur={field.onBlur}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="area"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="property-form-area">
                      Area (sqft)
                    </FieldLabel>
                    <Input
                      id="property-form-area"
                      {...field}
                      type="text"
                      inputMode="decimal"
                      disabled={saving}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="yearBuilt"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="property-form-yearBuilt">
                      Year Built
                    </FieldLabel>
                    <Input
                      id="property-form-yearBuilt"
                      {...field}
                      type="number"
                      min={1800}
                      max={2100}
                      disabled={saving}
                      placeholder="e.g. 2024"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPinIcon className="h-5 w-5" />
              Location
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Search for a place or click on the map to set the property pin.
              Click on the map to set the pin. Enter location and address below.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <SearchLocationInput
              value={form.watch("address") ?? ""}
              placeholder="Search for a place or address..."
              disabled={saving}
              onSelect={(details) => {
                form.setValue("lat", details.lat);
                form.setValue("lng", details.lng);
                form.setValue("address", details.formattedAddress);
              }}
            />
            <div>
              <LocationMap
                pins={
                  form.watch("lat") != null &&
                  form.watch("lng") != null &&
                  !Number.isNaN(Number(form.watch("lat"))) &&
                  !Number.isNaN(Number(form.watch("lng")))
                    ? [
                        {
                          lat: Number(form.watch("lat")),
                          lng: Number(form.watch("lng")),
                        },
                      ]
                    : undefined
                }
                onPinDragEnd={(pin) => {
                  form.setValue("lat", pin.lat);
                  form.setValue("lng", pin.lng);
                }}
              />
            </div>

            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="property-form-address">
                    Address
                  </FieldLabel>
                  <Input
                    id="property-form-address"
                    {...field}
                    disabled={saving}
                    placeholder="Full address (from search)"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileImageIcon className="h-5 w-5" />
              Media
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Gallery images, features and brochure
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Gallery images</Label>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    disabled={saving || storageLoading}
                    className="hidden"
                    id="gallery-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={saving || storageLoading}
                    onClick={() =>
                      document.getElementById("gallery-upload")?.click()
                    }
                  >
                    {storageLoading ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <UploadIcon className="mr-2 h-4 w-4" />
                        Upload images
                      </>
                    )}
                  </Button>
                </div>
                {imageKeysList.length > 0 ? (
                  <GalleryImagePreview
                    keys={imageKeysList}
                    onRemove={removeImageKey}
                    disabled={saving}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No images. Upload or paste keys below.
                  </p>
                )}

                {storageError && (
                  <p className="text-sm text-destructive">
                    {storageError.message}
                  </p>
                )}
              </div>
            </div>
            <Controller
              name="featuresStr"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="property-form-featuresStr">
                    Features
                  </FieldLabel>
                  <Input
                    id="property-form-featuresStr"
                    {...field}
                    disabled={saving}
                    placeholder="Parking, Gym, Pool (comma-separated)"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <div className="space-y-2">
              <Label>Brochure (PDF)</Label>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleBrochureUpload}
                    disabled={saving || storageLoading}
                    className="hidden"
                    id="brochure-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={saving || storageLoading}
                    onClick={() =>
                      document.getElementById("brochure-upload")?.click()
                    }
                  >
                    {storageLoading ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <UploadIcon className="mr-2 h-4 w-4" />
                        Upload PDF (max 20MB)
                      </>
                    )}
                  </Button>
                  {form.watch("brochureKey") && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={saving}
                      onClick={() => form.setValue("brochureKey", "")}
                      className="text-muted-foreground"
                      aria-label="Clear brochure"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
                {form.watch("brochureKey") ? (
                  <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm">
                    <FileTextIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate font-mono text-muted-foreground hover:underline">
                      <a href={getCdnImageUrl(form.watch("brochureKey"))}>
                        {form.watch("brochureKey")}
                      </a>
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No brochure. Upload a PDF or leave empty.
                  </p>
                )}
                {storageError && (
                  <p className="text-sm text-destructive">
                    {storageError.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LayoutGridIcon className="h-5 w-5" />
              Project details
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Fixed fields for project name, orientation, sizes and developer
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {PROJECT_DETAIL_FIELDS.map(({ key, label }) => (
                <Controller
                  key={key}
                  name={key}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`property-form-${key}`}>
                        {label}
                      </FieldLabel>
                      <Input
                        id={`property-form-${key}`}
                        {...field}
                        value={field.value ?? ""}
                        disabled={saving}
                        placeholder={label}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="container flex flex-wrap items-center justify-end gap-4 px-4 md:px-8">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/properties">Cancel</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset(getDefaultValues(property))}
            disabled={saving}
          >
            Reset
          </Button>
          <Button type="submit" form="property-form" disabled={saving}>
            {saving ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : isEdit ? (
              "Update Property"
            ) : (
              "Create Property"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
