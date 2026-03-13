"use server";

import { db } from "../db";
import { contactInquiriesTable, type NewContactInquiry } from "../schema";

export async function submitContactInquiry(
  inquiry: Omit<NewContactInquiry, "id" | "status" | "createdAt">,
) {
  const rows = await db
    .insert(contactInquiriesTable)
    .values(inquiry)
    .returning();

  return rows[0];
}
