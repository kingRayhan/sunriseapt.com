import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { getBucket, getS3Client } from "@/lib/s3";

const SIGNED_URL_EXPIRES_IN = 3600; // 1 hour

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      key,
      keys,
      operation = "get",
    } = body as {
      key?: string;
      keys?: string[];
      operation?: "get" | "put";
    };

    const keyList: string[] =
      keys && Array.isArray(keys)
        ? keys
            .map((k) => (typeof k === "string" ? k.trim() : ""))
            .filter(Boolean)
        : key && typeof key === "string" && key.trim() !== ""
          ? [key.trim()]
          : [];

    if (keyList.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid 'key' or 'keys' in request body" },
        { status: 400 },
      );
    }

    if (operation !== "get" && operation !== "put") {
      return NextResponse.json(
        { error: "Invalid 'operation'. Use 'get' or 'put'" },
        { status: 400 },
      );
    }

    if (operation === "put" && keyList.length > 1) {
      return NextResponse.json(
        { error: "Batch presigned URLs are only supported for 'get'" },
        { status: 400 },
      );
    }

    const client = getS3Client();
    const bucket = getBucket();

    if (operation === "get") {
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
    const { key } = body as { key?: string };
    if (!key || typeof key !== "string" || key.trim() === "") {
      return NextResponse.json(
        { error: "Missing or invalid 'key' in request body" },
        { status: 400 },
      );
    }
    const { deleteS3Object } = await import("@/lib/s3");
    await deleteS3Object(key.trim());
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete object";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Missing S3") ? 503 : 500 },
    );
  }
}
