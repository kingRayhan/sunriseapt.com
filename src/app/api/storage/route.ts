import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getBucket, getS3Client } from "@/lib/s3";
import { z } from "zod";

const SIGNED_URL_EXPIRES_IN = 3600; // 1 hour

export async function POST(request: Request) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();

    const bodySchema = z
      .object({
        key: z.preprocess(
          (v) => (typeof v === "string" ? v.trim() : v),
          z.string().min(1).optional(),
        ),
        keys: z.array(z.string()).optional(),
        operation: z.enum(["get", "put"]).default("get"),
      })
      .strict();

    const parsed = bodySchema.parse(body);
    const keyList: string[] = parsed.keys
      ? parsed.keys.map((k) => k.trim()).filter(Boolean)
      : parsed.key
        ? [parsed.key]
        : [];

    if (keyList.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid 'key' or 'keys' in request body" },
        { status: 400 },
      );
    }

    if (parsed.operation === "put" && keyList.length > 1) {
      return NextResponse.json(
        { error: "Batch presigned URLs are only supported for 'get'" },
        { status: 400 },
      );
    }

    const client = getS3Client();
    const bucket = getBucket();

    if (parsed.operation === "get") {
      const urls = await Promise.all(
        keyList.map((k) =>
          getSignedUrl(
            client,
            new GetObjectCommand({ Bucket: bucket, Key: k }),
            { expiresIn: SIGNED_URL_EXPIRES_IN },
          ),
        ),
      );
      return NextResponse.json(
        keyList.length === 1 ? { url: urls[0] } : { urls },
      );
    }

    const k = keyList[0];
    const url = await getSignedUrl(
      client,
      new PutObjectCommand({ Bucket: bucket, Key: k }),
      { expiresIn: SIGNED_URL_EXPIRES_IN },
    );
    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: err.issues },
        { status: 400 },
      );
    }
    const message =
      err instanceof Error ? err.message : "Failed to generate signed URL";
    return NextResponse.json(
      { error: message },
      {
        status:
          err instanceof Error && message.includes("Missing S3") ? 503 : 500,
      },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const bodySchema = z
      .object({
        key: z.preprocess(
          (v) => (typeof v === "string" ? v.trim() : v),
          z.string().min(1),
        ),
      })
      .strict();
    const { key } = bodySchema.parse(body);
    const { deleteS3Object } = await import("@/lib/s3");
    await deleteS3Object(key);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", issues: err.issues },
        { status: 400 },
      );
    }
    const message =
      err instanceof Error ? err.message : "Failed to delete object";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Missing S3") ? 503 : 500 },
    );
  }
}
