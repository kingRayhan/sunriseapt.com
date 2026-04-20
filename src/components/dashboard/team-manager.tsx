"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { TeamMember } from "@/drizzle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Label } from "@/components/ui/label";
import { useDropzone } from "react-dropzone";
import { useStorage } from "@/hooks/use-storage";
import { getCdnBaseUrl, getCdnImageUrl } from "@/lib/utils";
import { Loader2Icon, PlusIcon, Trash2Icon, UploadIcon } from "lucide-react";

type Draft = {
  name: string;
  role: string;
  bio: string;
  sortOrder: string;
  imageKey: string;
};

function memberToDraft(m?: TeamMember | null): Draft {
  return {
    name: m?.name ?? "",
    role: m?.role ?? "",
    bio: m?.bio ?? "",
    sortOrder: String(m?.sortOrder ?? 0),
    imageKey: m?.imageKey ?? "",
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

export function TeamManager({ members }: { members: TeamMember[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [createDragging, setCreateDragging] = useState(false);
  const [editDragging, setEditDragging] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpenId, setEditOpenId] = useState<string | null>(null);

  const editingMember = useMemo(
    () => members.find((m) => m.id === editOpenId) ?? null,
    [editOpenId, members],
  );

  const [createDraft, setCreateDraft] = useState<Draft>(() => memberToDraft());
  const [editDraft, setEditDraft] = useState<Draft>(() =>
    memberToDraft(editingMember),
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
        const uploaded = await uploadFiles(files, "team");
        const key = uploaded[0]?.key;
        if (key) setCreateDraft((d) => ({ ...d, imageKey: key }));
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
        const uploaded = await uploadFiles(files, "team");
        const key = uploaded[0]?.key;
        if (key) setEditDraft((d) => ({ ...d, imageKey: key }));
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
    const m = members.find((x) => x.id === id) ?? null;
    setEditDraft(memberToDraft(m));
  }

  async function handleCreate() {
    setSaving(true);
    setError(null);
    try {
      await fetchJson<TeamMember>("/api/dashboard/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createDraft.name,
          role: createDraft.role,
          bio: createDraft.bio,
          sortOrder: createDraft.sortOrder,
          imageKey: createDraft.imageKey || null,
        }),
      });
      setCreateOpen(false);
      setCreateDraft(memberToDraft());
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
      await fetchJson<TeamMember>(`/api/dashboard/team/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editDraft.name,
          role: editDraft.role,
          bio: editDraft.bio,
          sortOrder: editDraft.sortOrder,
          imageKey: editDraft.imageKey || null,
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
      await fetchJson<{ ok: true }>(`/api/dashboard/team/${id}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [members]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {members.length} member{members.length === 1 ? "" : "s"}
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCreateDraft(memberToDraft())}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Add team member</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tm-create-name">Name</Label>
                <Input
                  id="tm-create-name"
                  value={createDraft.name}
                  onChange={(e) =>
                    setCreateDraft((d) => ({ ...d, name: e.target.value }))
                  }
                  placeholder="Jane Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tm-create-role">Role</Label>
                <Input
                  id="tm-create-role"
                  value={createDraft.role}
                  onChange={(e) =>
                    setCreateDraft((d) => ({ ...d, role: e.target.value }))
                  }
                  placeholder="Founder & CEO"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tm-create-bio">Bio</Label>
                <Textarea
                  id="tm-create-bio"
                  value={createDraft.bio}
                  onChange={(e) =>
                    setCreateDraft((d) => ({ ...d, bio: e.target.value }))
                  }
                  placeholder="Short bio (optional)"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="tm-create-sort">Sort order</Label>
                  <Input
                    id="tm-create-sort"
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
              </div>

              <div className="grid gap-2">
                <Label>Image</Label>
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
                      <Label htmlFor="tm-create-imageKey">Image key</Label>
                      <Input
                        id="tm-create-imageKey"
                        value={createDraft.imageKey}
                        onChange={(e) =>
                          setCreateDraft((d) => ({
                            ...d,
                            imageKey: e.target.value,
                          }))
                        }
                        placeholder="team/jane.jpg (or upload)"
                      />
                    </div>

                    {!cdnEnabled ? (
                      <p className="mt-3 text-xs text-muted-foreground">
                        CDN not configured; images will still work in dashboard
                        previews, but the public site will show placeholders
                        unless `NEXT_PUBLIC_CDN_URL` is set.
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </div>

              {createDraft.imageKey ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 overflow-hidden rounded-md bg-muted">
                        {getCdnImageUrl(createDraft.imageKey) ? (
                          <img
                            src={getCdnImageUrl(createDraft.imageKey)!}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full" aria-hidden />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Preview</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {createDraft.imageKey}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}

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
        {sortedMembers.map((m) => (
          <Card key={m.id}>
            <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                  {m.imageKey && getCdnImageUrl(m.imageKey) ? (
                    <img
                      src={getCdnImageUrl(m.imageKey)!}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full" aria-hidden />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{m.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {m.role} • sort {m.sortOrder}
                  </p>
                  {m.bio ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {m.bio}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Dialog
                  open={editOpenId === m.id}
                  onOpenChange={(open) => {
                    if (!open) return setEditOpenId(null);
                    openEdit(m.id);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => openEdit(m.id)}>
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                      <DialogTitle>Edit team member</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="tm-edit-name">Name</Label>
                        <Input
                          id="tm-edit-name"
                          value={editDraft.name}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="tm-edit-role">Role</Label>
                        <Input
                          id="tm-edit-role"
                          value={editDraft.role}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              role: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="tm-edit-bio">Bio</Label>
                        <Textarea
                          id="tm-edit-bio"
                          value={editDraft.bio}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              bio: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="tm-edit-sort">Sort order</Label>
                          <Input
                            id="tm-edit-sort"
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
                      </div>

                      <div className="grid gap-2">
                        <Label>Image</Label>
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
                              <Label htmlFor="tm-edit-imageKey">Image key</Label>
                              <Input
                                id="tm-edit-imageKey"
                                value={editDraft.imageKey}
                                onChange={(e) =>
                                  setEditDraft((d) => ({
                                    ...d,
                                    imageKey: e.target.value,
                                  }))
                                }
                                placeholder="team/jane.jpg (or upload)"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {editDraft.imageKey ? (
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                              <div className="h-16 w-16 overflow-hidden rounded-md bg-muted">
                                {getCdnImageUrl(editDraft.imageKey) ? (
                                  <img
                                    src={getCdnImageUrl(editDraft.imageKey)!}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full" aria-hidden />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium">Preview</p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {editDraft.imageKey}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : null}
                    </div>

                    {error ? (
                      <p className="text-sm text-destructive">{error}</p>
                    ) : null}

                    <DialogFooter>
                      <Button
                        onClick={() => handleUpdate(m.id)}
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
                      disabled={deletingId === m.id}
                      aria-label={`Delete ${m.name}`}
                    >
                      {deletingId === m.id ? (
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2Icon className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete team member?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove {m.name} from the About page. This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(m.id)}
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
        ))}
      </div>
    </div>
  );
}

