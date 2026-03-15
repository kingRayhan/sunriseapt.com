import { PropertyForm } from "@/components/dashboard/property-form";
import { getPropertyById } from "@/drizzle/queries/properties";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) notFound();

  return (
    <div className="space-y-6">
      <PropertyForm property={property} />
    </div>
  );
}
