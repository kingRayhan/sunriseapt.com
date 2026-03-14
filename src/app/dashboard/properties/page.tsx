import Link from "next/link";
import { getAllProperties } from "@/drizzle/queries/properties";
import { PropertiesTable } from "@/components/dashboard/properties-table";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export const revalidate = 60;

export default async function DashboardPropertiesPage() {
  const properties = await getAllProperties();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/properties/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Property
          </Link>
        </Button>
      </div>
      <PropertiesTable properties={properties} />
    </div>
  );
}
