import { NextResponse } from "next/server";
import {
  getInquiryById,
  updateInquiry,
  deleteInquiry,
} from "@/drizzle/queries/contact";

function parseBody(body: unknown): { status?: string } {
  const o = body as Record<string, unknown>;
  const out: { status?: string } = {};
  if (typeof o?.status === "string" && o.status.trim())
    out.status = o.status.trim();
  return out;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const inquiry = await getInquiryById(id);
    if (!inquiry)
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    return NextResponse.json(inquiry);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to get inquiry";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const inquiry = await getInquiryById(id);
    if (!inquiry)
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    const body = await request.json();
    const data = parseBody(body);
    if (Object.keys(data).length === 0)
      return NextResponse.json(inquiry);
    const updated = await updateInquiry(id, data);
    return NextResponse.json(updated);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update inquiry";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const inquiry = await getInquiryById(id);
    if (!inquiry)
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    await deleteInquiry(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete inquiry";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
