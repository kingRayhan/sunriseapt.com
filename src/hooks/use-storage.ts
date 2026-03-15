"use client";

import { useMutation } from "@tanstack/react-query";

export interface UploadResult {
  key: string;
}

async function uploadOne(file: File, prefix: string): Promise<UploadResult> {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("prefix", prefix);
  const res = await fetch("/api/storage/upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data as { error?: string }).error ?? `Upload failed: ${res.status}`,
    );
  }
  const data = (await res.json()) as { key?: string };
  if (!data.key) throw new Error("Upload response missing key");
  return { key: data.key };
}

export interface UseStorageReturn {
  /** Upload multiple files. Returns array of { key } in same order as input files. */
  uploadFiles: (
    files: File[],
    directory?: string,
  ) => Promise<UploadResult[]>;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for uploading files to storage (S3/R2) via /api/storage/upload.
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
