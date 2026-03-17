"use client";

import { useMutation } from "@tanstack/react-query";

export interface UploadResult {
  key: string;
}

function getExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName) return fromName;
  if (file.type.startsWith("image/")) return file.type.split("/")[1] || "jpg";
  if (file.type === "application/pdf") return "pdf";
  return "bin";
}

function generateObjectKey(prefix: string, file: File): string {
  const ext = getExtension(file);
  return `${prefix}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
}

async function uploadOne(file: File, prefix: string): Promise<UploadResult> {
  const key = generateObjectKey(prefix, file);

  // Ask the backend for a presigned PUT URL for this key
  const signedRes = await fetch("/api/storage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key,
      operation: "put",
    }),
  });

  if (!signedRes.ok) {
    const data = await signedRes.json().catch(() => ({}));
    throw new Error(
      (data as { error?: string }).error ??
        `Failed to get upload URL: ${signedRes.status}`,
    );
  }

  const { url } = (await signedRes.json()) as { url?: string };
  if (!url) {
    throw new Error("Upload URL response missing url");
  }

  // Upload directly to object storage using the presigned URL
  const putRes = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!putRes.ok) {
    throw new Error(`Upload failed: ${putRes.status}`);
  }

  return { key };
}

export interface UseStorageReturn {
  /** Upload multiple files. Returns array of { key } in same order as input files. */
  uploadFiles: (files: File[], directory?: string) => Promise<UploadResult[]>;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for uploading files to storage (S3/R2) via presigned URLs from /api/storage.
 * Uses TanStack Query mutation under the hood.
 */
export function useStorage(): UseStorageReturn {
  const mutation = useMutation({
    mutationFn: async ({
      files,
      directory,
    }: {
      files: File[];
      directory: string;
    }): Promise<UploadResult[]> => {
      const results = await Promise.all(
        files.map((file) => uploadOne(file, directory)),
      );
      return results;
    },
  });

  const uploadFiles = async (
    files: File[],
    directory: string = "gallery",
  ): Promise<UploadResult[]> => {
    return mutation.mutateAsync({
      files: Array.from(files),
      directory,
    });
  };

  return {
    uploadFiles,
    loading: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error : null,
  };
}
