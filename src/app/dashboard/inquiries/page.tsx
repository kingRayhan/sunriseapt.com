import { getAllInquiries } from "@/drizzle/queries/contact";
import { InquiriesTable } from "@/components/dashboard/inquiries-table";
import type { InquiryListItem } from "@/components/dashboard/inquiries-table";

export const revalidate = 60;

function mapInquiryToListItem(
  row: Awaited<ReturnType<typeof getAllInquiries>>[number],
): InquiryListItem {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    propertyId: row.propertyId,
    status: row.status,
    createdAt: row.createdAt,
    propertyTitle: row.propertyTitle ?? null,
    propertySlug: row.propertySlug ?? null,
  };
}

export default async function DashboardInquiriesPage() {
  const rows = await getAllInquiries();
  const inquiries: InquiryListItem[] = rows.map(mapInquiryToListItem);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inquiries</h1>
        <p className="text-muted-foreground">
          Contact form submissions and property inquiries
        </p>
      </div>
      <InquiriesTable inquiries={inquiries} />
    </div>
  );
}
