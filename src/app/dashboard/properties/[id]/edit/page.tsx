import { notFound } from "next/navigation";
import { getPropertyById } from "@/drizzle/queries/properties";
import { PropertyForm } from "@/components/dashboard/property-form";

interface Props {
  params: { id: string };
}

export default async function EditPropertyPage({ params }: Props) {
  const property = await getPropertyById(params.id);
  if (!property) notFound();

  return (
    <div className="space-y-6">
      <PropertyForm property={property} />
    </div>
  );
}
