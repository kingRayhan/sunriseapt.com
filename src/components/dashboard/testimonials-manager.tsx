"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import type { Testimonial } from "@/drizzle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useStorage } from "@/hooks/use-storage";
import { getCdnBaseUrl, getCdnImageUrl } from "@/lib/utils";
import {
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
  UploadIcon,
  VideoIcon,
} from "lucide-react";

type Draft = {
  title: string;
  shortDescription: string;
  authorName: string;
  authorTitle: string;
  projectBrand: string;
  overlayLine: string;
  videoUrl: string;
  posterKey: string;
  sortOrder: string;
  published: boolean;
};

function testimonialToDraft(t?: Testimonial | null): Draft {
  return {
    title: t?.title ?? "",
    shortDescription: t?.shortDescription ?? "",
    authorName: t?.authorName ?? "",
    authorTitle: t?.authorTitle ?? "",
    projectBrand: t?.projectBrand ?? "",
    overlayLine: t?.overlayLine ?? "",
    videoUrl: t?.videoUrl ?? "",
    posterKey: t?.posterKey ?? "",
    sortOrder: String(t?.sortOrder ?? 0),
    published: t?.published ?? true,
  };
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const data = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "error" in data
        ? String((data as { error?: unknown }).error ?? "Request failed")
        : "Request failed";
    throw new Error(msg);
  }
  return data as T;
}

export function TestimonialsManager({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpenId, setEditOpenId] = useState<string | null>(null);
  const [createDragging, setCreateDragging] = useState(false);
  const [editDragging, setEditDragging] = useState(false);

  const editing = useMemo(
    () => testimonials.find((t) => t.id === editOpenId) ?? null,
    [editOpenId, testimonials],
  );

  const [createDraft, setCreateDraft] = useState<Draft>(() =>
    testimonialToDraft(),
  );
  const [editDraft, setEditDraft] = useState<Draft>(() =>
    testimonialToDraft(editing),
  );

  const { uploadFiles, loading: storageLoading } = useStorage();
  const cdnEnabled = Boolean(getCdnBaseUrl());

  const createDropzone = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    disabled: saving || storageLoading,
    onDragEnter: () => setCreateDragging(true),
    onDragLeave: () => setCreateDragging(false),
    onDropAccepted: async (files) => {
      setError(null);
      setCreateDragging(false);
      try {
        const uploaded = await uploadFiles(files, "testimonials");
        const key = uploaded[0]?.key;
        if (key) setCreateDraft((d) => ({ ...d, posterKey: key }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    },
    onDropRejected: (rejections) => {
      setCreateDragging(false);
      const msg = rejections
        .flatMap((r) => r.errors.map((e) => e.message))
        .join("; ");
      setError(msg || "Invalid file. Only images are allowed.");
    },
  });

  const editDropzone = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    disabled: saving || storageLoading,
    onDragEnter: () => setEditDragging(true),
    onDragLeave: () => setEditDragging(false),
    onDropAccepted: async (files) => {
      setError(null);
      setEditDragging(false);
      try {
        const uploaded = await uploadFiles(files, "testimonials");
        const key = uploaded[0]?.key;
        if (key) setEditDraft((d) => ({ ...d, posterKey: key }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    },
    onDropRejected: (rejections) => {
      setEditDragging(false);
      const msg = rejections
        .flatMap((r) => r.errors.map((e) => e.message))
        .join("; ");
      setError(msg || "Invalid file. Only images are allowed.");
    },
  });

  function openEdit(id: string) {
    setError(null);
    setEditOpenId(id);
    const t = testimonials.find((x) => x.id === id) ?? null;
    setEditDraft(testimonialToDraft(t));
  }

  async function handleCreate() {
    setSaving(true);
    setError(null);
    try {
      await fetchJson<Testimonial>("/api/dashboard/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createDraft,
          overlayLine: createDraft.overlayLine || null,
          sortOrder: createDraft.sortOrder,
        }),
      });
      setCreateOpen(false);
      setCreateDraft(testimonialToDraft());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string) {
    setSaving(true);
    setError(null);
    try {
      await fetchJson<Testimonial>(`/api/dashboard/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editDraft,
          overlayLine: editDraft.overlayLine || null,
          sortOrder: editDraft.sortOrder,
        }),
      });
      setEditOpenId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      await fetchJson<{ ok: true }>(`/api/dashboard/testimonials/${id}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  const sorted = useMemo(() => {
    return [...testimonials].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
  }, [testimonials]);

  const previewUrlForKey = (key: string) => {
    const cdn = getCdnImageUrl(key);
    return cdn ?? null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {testimonials.length} testimonial{testimonials.length === 1 ? "" : "s"}
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCreateDraft(testimonialToDraft())}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add testimonial</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="tm-title">Title</Label>
                  <Input
                    id="tm-title"
                    value={createDraft.title}
                    onChange={(e) =>
                      setCreateDraft((d) => ({ ...d, title: e.target.value }))
                    }
                    placeholder="A seamless handover"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tm-brand">Project brand</Label>
                  <Input
                    id="tm-brand"
                    value={createDraft.projectBrand}
                    onChange={(e) =>
                      setCreateDraft((d) => ({
                        ...d,
                        projectBrand: e.target.value,
                      }))
                    }
                    placeholder="Sunrise Heights"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tm-desc">Short description</Label>
                <Textarea
                  id="tm-desc"
                  value={createDraft.shortDescription}
                  onChange={(e) =>
                    setCreateDraft((d) => ({
                      ...d,
                      shortDescription: e.target.value,
                    }))
                  }
                  placeholder="A short quote from the customer…"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="tm-author">Author name</Label>
                  <Input
                    id="tm-author"
                    value={createDraft.authorName}
                    onChange={(e) =>
                      setCreateDraft((d) => ({
                        ...d,
                        authorName: e.target.value,
                      }))
                    }
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tm-authorTitle">Author title</Label>
                  <Input
                    id="tm-authorTitle"
                    value={createDraft.authorTitle}
                    onChange={(e) =>
                      setCreateDraft((d) => ({
                        ...d,
                        authorTitle: e.target.value,
                      }))
                    }
                    placeholder="Apartment owner"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tm-overlay">Overlay line (optional)</Label>
                <Input
                  id="tm-overlay"
                  value={createDraft.overlayLine}
                  onChange={(e) =>
                    setCreateDraft((d) => ({
                      ...d,
                      overlayLine: e.target.value,
                    }))
                  }
                  placeholder="“The build quality exceeded our expectations.”"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="tm-sort">Sort order</Label>
                  <Input
                    id="tm-sort"
                    inputMode="numeric"
                    value={createDraft.sortOrder}
                    onChange={(e) =>
                      setCreateDraft((d) => ({
                        ...d,
                        sortOrder: e.target.value,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Published</p>
                    <p className="text-xs text-muted-foreground">
                      Show on the homepage section
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={createDraft.published}
                      onCheckedChange={(v) =>
                        setCreateDraft((d) => ({ ...d, published: Boolean(v) }))
                      }
                      aria-label="Published"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Poster image</Label>
                <Card>
                  <CardContent className="pt-6">
                    <div
                      {...createDropzone.getRootProps()}
                      className={`
                        min-h-[140px] rounded-lg border-2 border-dashed p-6 text-center
                        transition-colors cursor-pointer
                        hover:border-primary/50 hover:bg-muted/30
                        ${createDragging ? "border-primary bg-muted/50" : "border-muted-foreground/25"}
                        ${saving || storageLoading ? "pointer-events-none opacity-70" : ""}
                      `}
                    >
                      <input {...createDropzone.getInputProps()} />
                      {storageLoading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2Icon className="h-10 w-10 animate-spin text-primary" />
                          <p className="text-sm font-medium">Uploading…</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <UploadIcon className="h-10 w-10 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {createDragging
                              ? "Drop image here…"
                              : "Drag & drop image here, or click to select"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Single image. Images only.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 grid gap-2">
                      <Label htmlFor="tm-posterKey">Poster key</Label>
                      <Input
                        id="tm-posterKey"
                        value={createDraft.posterKey}
                        onChange={(e) =>
                          setCreateDraft((d) => ({
                            ...d,
                            posterKey: e.target.value,
                          }))
                        }
                        placeholder="testimonials/poster.jpg (or upload)"
                      />
                      {!cdnEnabled ? (
                        <p className="text-xs text-muted-foreground">
                          CDN not configured; the public site will show a blank
                          poster unless `NEXT_PUBLIC_CDN_URL` is set.
                        </p>
                      ) : null}
                    </div>

                    {createDraft.posterKey && previewUrlForKey(createDraft.posterKey) ? (
                      <div className="mt-4 flex items-center gap-3">
                        <div className="h-16 w-16 overflow-hidden rounded-md bg-muted">
                          <img
                            src={previewUrlForKey(createDraft.posterKey)!}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <p className="min-w-0 truncate text-xs text-muted-foreground">
                          {createDraft.posterKey}
                        </p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tm-video">Video URL (YouTube)</Label>
                <div className="flex items-center gap-2">
                  <VideoIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <Input
                    id="tm-video"
                    value={createDraft.videoUrl}
                    onChange={(e) =>
                      setCreateDraft((d) => ({ ...d, videoUrl: e.target.value }))
                    }
                    placeholder="https://www.youtube.com/watch?v=…"
                  />
                </div>
              </div>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={saving || storageLoading}
              >
                {saving ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3">
        {sorted.map((t) => {
          const cover =
            t.posterKey && previewUrlForKey(t.posterKey)
              ? previewUrlForKey(t.posterKey)
              : null;

          return (
            <Card key={t.id}>
              <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                    {cover ? (
                      <img
                        src={cover}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{t.title}</p>
                      {!t.published ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          Unpublished
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {t.authorName} • {t.projectBrand} • sort {t.sortOrder}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {t.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Dialog
                    open={editOpenId === t.id}
                    onOpenChange={(open) => {
                      if (!open) return setEditOpenId(null);
                      openEdit(t.id);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => openEdit(t.id)}>
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Edit testimonial</DialogTitle>
                      </DialogHeader>

                      <div className="grid gap-4">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="ed-title">Title</Label>
                            <Input
                              id="ed-title"
                              value={editDraft.title}
                              onChange={(e) =>
                                setEditDraft((d) => ({
                                  ...d,
                                  title: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="ed-brand">Project brand</Label>
                            <Input
                              id="ed-brand"
                              value={editDraft.projectBrand}
                              onChange={(e) =>
                                setEditDraft((d) => ({
                                  ...d,
                                  projectBrand: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="ed-desc">Short description</Label>
                          <Textarea
                            id="ed-desc"
                            value={editDraft.shortDescription}
                            onChange={(e) =>
                              setEditDraft((d) => ({
                                ...d,
                                shortDescription: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="ed-author">Author name</Label>
                            <Input
                              id="ed-author"
                              value={editDraft.authorName}
                              onChange={(e) =>
                                setEditDraft((d) => ({
                                  ...d,
                                  authorName: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="ed-authorTitle">Author title</Label>
                            <Input
                              id="ed-authorTitle"
                              value={editDraft.authorTitle}
                              onChange={(e) =>
                                setEditDraft((d) => ({
                                  ...d,
                                  authorTitle: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="ed-overlay">Overlay line (optional)</Label>
                          <Input
                            id="ed-overlay"
                            value={editDraft.overlayLine}
                            onChange={(e) =>
                              setEditDraft((d) => ({
                                ...d,
                                overlayLine: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="ed-sort">Sort order</Label>
                            <Input
                              id="ed-sort"
                              inputMode="numeric"
                              value={editDraft.sortOrder}
                              onChange={(e) =>
                                setEditDraft((d) => ({
                                  ...d,
                                  sortOrder: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium">Published</p>
                              <p className="text-xs text-muted-foreground">
                                Show on the homepage section
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={editDraft.published}
                                onCheckedChange={(v) =>
                                  setEditDraft((d) => ({
                                    ...d,
                                    published: Boolean(v),
                                  }))
                                }
                                aria-label="Published"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label>Poster image</Label>
                          <Card>
                            <CardContent className="pt-6">
                              <div
                                {...editDropzone.getRootProps()}
                                className={`
                                  min-h-[140px] rounded-lg border-2 border-dashed p-6 text-center
                                  transition-colors cursor-pointer
                                  hover:border-primary/50 hover:bg-muted/30
                                  ${editDragging ? "border-primary bg-muted/50" : "border-muted-foreground/25"}
                                  ${saving || storageLoading ? "pointer-events-none opacity-70" : ""}
                                `}
                              >
                                <input {...editDropzone.getInputProps()} />
                                {storageLoading ? (
                                  <div className="flex flex-col items-center gap-2">
                                    <Loader2Icon className="h-10 w-10 animate-spin text-primary" />
                                    <p className="text-sm font-medium">
                                      Uploading…
                                    </p>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-2">
                                    <UploadIcon className="h-10 w-10 text-muted-foreground" />
                                    <p className="text-sm font-medium">
                                      {editDragging
                                        ? "Drop image here…"
                                        : "Drag & drop image here, or click to select"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Single image. Images only.
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="mt-4 grid gap-2">
                                <Label htmlFor="ed-posterKey">Poster key</Label>
                                <Input
                                  id="ed-posterKey"
                                  value={editDraft.posterKey}
                                  onChange={(e) =>
                                    setEditDraft((d) => ({
                                      ...d,
                                      posterKey: e.target.value,
                                    }))
                                  }
                                  placeholder="testimonials/poster.jpg (or upload)"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="ed-video">Video URL (YouTube)</Label>
                          <Input
                            id="ed-video"
                            value={editDraft.videoUrl}
                            onChange={(e) =>
                              setEditDraft((d) => ({
                                ...d,
                                videoUrl: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      {error ? (
                        <p className="text-sm text-destructive">{error}</p>
                      ) : null}

                      <DialogFooter>
                        <Button
                          onClick={() => handleUpdate(t.id)}
                          disabled={saving || storageLoading}
                        >
                          {saving ? (
                            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Save changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        disabled={deletingId === t.id}
                        aria-label={`Delete testimonial ${t.title}`}
                      >
                        {deletingId === t.id ? (
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2Icon className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete testimonial?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the testimonial from the homepage
                          section. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(t.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

