import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { contactInquiriesTable, propertiesTable, type NewContactInquiry } from "../schema";

export async function submitContactInquiry(
  inquiry: Omit<NewContactInquiry, "id" | "status" | "createdAt">,
) {
  const rows = await db
    .insert(contactInquiriesTable)
    .values(inquiry)
    .returning();

  return rows[0];
}

export async function getAllInquiries() {
  return db
    .select({
      id: contactInquiriesTable.id,
      name: contactInquiriesTable.name,
      email: contactInquiriesTable.email,
      phone: contactInquiriesTable.phone,
      message: contactInquiriesTable.message,
      propertyId: contactInquiriesTable.propertyId,
      status: contactInquiriesTable.status,
      createdAt: contactInquiriesTable.createdAt,
      propertyTitle: propertiesTable.title,
      propertySlug: propertiesTable.slug,
    })
    .from(contactInquiriesTable)
    .leftJoin(
      propertiesTable,
      eq(contactInquiriesTable.propertyId, propertiesTable.id),
    )
    .orderBy(desc(contactInquiriesTable.createdAt));
}

export async function getInquiryById(id: string) {
  const rows = await db
    .select()
    .from(contactInquiriesTable)
    .where(eq(contactInquiriesTable.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateInquiry(
  id: string,
  data: { status?: string },
) {
  const [row] = await db
    .update(contactInquiriesTable)
    .set(data)
    .where(eq(contactInquiriesTable.id, id))
    .returning();
  return row;
}

export async function deleteInquiry(id: string) {
  await db.delete(contactInquiriesTable).where(eq(contactInquiriesTable.id, id));
}
