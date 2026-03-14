"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2Icon,
  ArrowLeftIcon,
  MapPinIcon,
  FileImageIcon,
  LayoutGridIcon,
  UploadIcon,
  FileTextIcon,
  X,
} from "lucide-react";
import type { Property } from "@/drizzle";
import type { ProjectDetail } from "@/drizzle/schema";
import { GalleryImagePreview } from "@/components/dashboard/gallery-image-preview";
import { getCdnImageUrl } from "@/lib/utils";

const LocationMap = dynamic(
  () =>
    import("@/components/dashboard/location-map").then((m) => ({
      default: m.LocationMap,
    })),
  { ssr: false },
);

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
  description: z.string().optional(),
  price: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  bedrooms: z.coerce.number().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  area: z.string().optional(),
  yearBuilt: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  featured: z.boolean().optional(),
  imagesStr: z.string().optional(),
  featuresStr: z.string().optional(),
  projectDetailsStr: z.string().optional(),
  brochureKey: z.string().optional(),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

function getDefaultValues(property?: Property | null): PropertyFormValues {
  return {
    title: property?.title ?? "",
    slug: property?.slug ?? "",
    description: property?.description ?? "",
    price: property?.price ?? "0",
    type: property?.type ?? "apartment",
    status: property?.status ?? "available",
    bedrooms: property?.bedrooms ?? 0,
    bathrooms: property?.bathrooms ?? 0,
    area: property?.area ?? "0",
    yearBuilt: property?.yearBuilt != null ? String(property.yearBuilt) : "",
    location: property?.location ?? "",
    address: property?.address ?? "",
    lat: property?.lat ?? undefined,
    lng: property?.lng ?? undefined,
    featured: property?.featured ?? false,
    imagesStr: Array.isArray(property?.images)
      ? property.images.join(", ")
      : "",
    featuresStr: Array.isArray(property?.features)
      ? property.features.join(", ")
      : "",
    projectDetailsStr: Array.isArray(property?.projectDetails)
      ? JSON.stringify(property.projectDetails, null, 2)
      : "[]",
    brochureKey: property?.brochureKey ?? "",
  };
}

interface PropertyFormProps {
  property?: Property | null;
}

export function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter();
  const isEdit = !!property;
  const [brochureUploading, setBrochureUploading] = useState(false);
  const [brochureUploadError, setBrochureUploadError] = useState<string | null>(
    null,
  );
  const [imagesUploading, setImagesUploading] = useState(false);
  const [imagesUploadError, setImagesUploadError] = useState<string | null>(
    null,
  );

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: getDefaultValues(property),
    mode: "onTouched",
  });

  const saveMutation = useMutation({
    mutationFn: async (values: PropertyFormValues) => {
      let projectDetails: ProjectDetail[] = [];
      try {
        const parsed = JSON.parse(values.projectDetailsStr || "[]");
        projectDetails = Array.isArray(parsed)
          ? parsed.filter(
              (x: unknown): x is ProjectDetail =>
                x != null &&
                typeof x === "object" &&
                "label" in x &&
                "value" in x &&
                typeof (x as ProjectDetail).label === "string" &&
                typeof (x as ProjectDetail).value === "string",
            )
          : [];
      } catch {
        throw new Error(
          "Project details must be valid JSON array of { label, value }",
        );
      }
      const body = {
        title: values.title.trim(),
        slug: values.slug.trim() || slugify(values.title),
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
        location: values.location?.trim() || null,
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
      router.push("/dashboard/properties");
      router.refresh();
    },
  });

  const onSubmit = form.handleSubmit((values) => saveMutation.mutate(values));

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
      setBrochureUploadError("Please select a PDF file.");
      return;
    }
    setBrochureUploadError(null);
    setBrochureUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prefix", "brochures");
      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Upload failed");
      }
      const { key } = await res.json();
      form.setValue("brochureKey", key);
    } catch (err) {
      setBrochureUploadError(
        err instanceof Error ? err.message : "Upload failed",
      );
    } finally {
      setBrochureUploading(false);
      e.target.value = "";
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setImagesUploadError(null);
    setImagesUploading(true);
    const keys: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("prefix", "gallery");
        const res = await fetch("/api/storage/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error ?? "Upload failed");
        }
        const { key } = await res.json();
        keys.push(key);
      }
      const current = form.getValues("imagesStr") ?? "";
      const existing = current
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      form.setValue("imagesStr", [...existing, ...keys].join(", "));
    } catch (err) {
      setImagesUploadError(
        err instanceof Error ? err.message : "Upload failed",
      );
    } finally {
      setImagesUploading(false);
      e.target.value = "";
    }
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
    <Form {...form}>
      <form
        id="property-form"
        onSubmit={onSubmit}
        className="flex min-h-[calc(100vh-var(--header-height,5rem))] flex-col"
      >
        <div className="flex-1 space-y-8 pb-24">
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
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onBlur={() => {
                            field.onBlur();
                            syncSlugFromTitle();
                          }}
                          disabled={saving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={saving}
                          placeholder="url-friendly-name"
                        />
                      </FormControl>
                      <FormDescription>
                        URL-friendly identifier. Auto-generated from title if
                        left blank.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        disabled={saving}
                        rows={4}
                        className={inputClassName}
                      />
                    </FormControl>
                    <FormDescription>
                      Full property description for the listing page.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
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
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        name={field.name}
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={saving}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="penthouse">Penthouse</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        name={field.name}
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={saving}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          inputMode="decimal"
                          disabled={saving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured</FormLabel>
                      <FormControl>
                        <div className="flex h-10 items-center pt-2">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={saving}
                          />
                          <label className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Show on homepage
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
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
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area (sqft)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          inputMode="decimal"
                          disabled={saving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yearBuilt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Built</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={1800}
                          max={2100}
                          disabled={saving}
                          placeholder="e.g. 2024"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
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
                Location and address are filled from search.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <LocationMap
                  lat={form.watch("lat")}
                  lng={form.watch("lng")}
                  onLocationChange={(lat, lng) => {
                    form.setValue("lat", lat);
                    form.setValue("lng", lng);
                  }}
                  onSearchResult={({ location, address }) => {
                    form.setValue("location", location);
                    form.setValue("address", address);
                  }}
                  disabled={saving}
                />
              </div>
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={saving}
                        placeholder="e.g. Uttara, Dhaka (from search)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={saving}
                        placeholder="Full address (from search)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Media & details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileImageIcon className="h-5 w-5" />
                Media & project details
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Image keys, features, project details and brochure
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
                      disabled={saving || imagesUploading}
                      className="hidden"
                      id="gallery-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={saving || imagesUploading}
                      onClick={() =>
                        document.getElementById("gallery-upload")?.click()
                      }
                    >
                      {imagesUploading ? (
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
                  {/* <FormField
                  control={form.control}
                  name="imagesStr"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={saving}
                          placeholder="gallery/1.jpg, gallery/2.jpg (or paste comma-separated keys)"
                          className="font-mono text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                  {imagesUploadError && (
                    <p className="text-sm text-destructive">
                      {imagesUploadError}
                    </p>
                  )}
                </div>
              </div>
              <FormField
                control={form.control}
                name="featuresStr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Features</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={saving}
                        placeholder="Parking, Gym, Pool (comma-separated)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectDetailsStr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project details (JSON)</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        disabled={saving}
                        rows={5}
                        className={`${inputClassName} font-mono`}
                        placeholder='[{"label": "Front Road", "value": "40 ft"}, ...]'
                      />
                    </FormControl>
                    <FormDescription>
                      Array of objects with{" "}
                      <code className="text-xs">label</code> and{" "}
                      <code className="text-xs">value</code>.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
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
                      disabled={saving || brochureUploading}
                      className="hidden"
                      id="brochure-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={saving || brochureUploading}
                      onClick={() =>
                        document.getElementById("brochure-upload")?.click()
                      }
                    >
                      {brochureUploading ? (
                        <>
                          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                          Uploading…
                        </>
                      ) : (
                        <>
                          <UploadIcon className="mr-2 h-4 w-4" />
                          Upload PDF
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
                  {brochureUploadError && (
                    <p className="text-sm text-destructive">
                      {brochureUploadError}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
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
    </Form>
  );
}
