import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Use in API route handlers to require Clerk authentication.
 * Returns a 401 NextResponse if not signed in, otherwise null.
 */
export async function requireAuth(): Promise<NextResponse | null> {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
