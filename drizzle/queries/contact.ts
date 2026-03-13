import { db } from "../db";
import { contactInquiries, type NewContactInquiry } from "../schema";

export async function submitContactInquiry(
  inquiry: Omit<NewContactInquiry, "id" | "status" | "createdAt">,
) {
  const rows = await db
    .insert(contactInquiries)
    .values(inquiry)
    .returning();

  return rows[0];
}
