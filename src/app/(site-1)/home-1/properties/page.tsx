import type { Metadata } from "next";
import PropertyFilters from "@/components/PropertyFilters";
import { getProperties } from "@/drizzle/queries/properties";
import { SITE_NAME } from "@/lib/seo";

const description =
  "Browse premium apartments and properties from Sunriseapt. Filter by type and find your next home.";

export const metadata: Metadata = {
  title: "Properties",
  description,
  alternates: { canonical: "/properties" },
  openGraph: {
    url: "/properties",
    title: `Properties | ${SITE_NAME}`,
    description,
  },
  twitter: {
    title: `Properties | ${SITE_NAME}`,
    description,
  },
};

export const revalidate = 60;

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <div className="pt-20">
      <div className="bg-primary text-primary-foreground py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">
            Our Properties
          </h1>
          <p className="text-primary-foreground/70">
            Browse our collection of {properties.length} premium properties
          </p>
        </div>
      </div>

      <PropertyFilters properties={properties} />
    </div>
  );
}
