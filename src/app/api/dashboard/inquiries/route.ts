import { NextResponse } from "next/server";
import { getAllInquiries } from "@/drizzle/queries/contact";

export async function GET() {
  try {
    const inquiries = await getAllInquiries();
    return NextResponse.json(inquiries);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to list inquiries";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
