import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const S3_BUCKET = process.env.S3_BUCKET;
const AWS_REGION = process.env.AWS_REGION ?? "ap-south-1";

export function getS3Client(): S3Client {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey || !S3_BUCKET) {
    throw new Error(
      "Missing S3 config: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, or S3_BUCKET"
    );
  }
  return new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: AWS_REGION,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function getBucket(): string {
  if (!S3_BUCKET) throw new Error("Missing S3_BUCKET");
  return S3_BUCKET;
}

export async function deleteS3Object(key: string): Promise<void> {
  const client = getS3Client();
  const bucket = getBucket();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function uploadS3Object(
  key: string,
  body: Buffer | Uint8Array,
  contentType?: string
): Promise<void> {
  const client = getS3Client();
  const bucket = getBucket();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}
