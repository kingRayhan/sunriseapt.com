import PropertyFilters from "@/components/PropertyFilters";
import { getProperties } from "@/drizzle/queries/properties";

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
