"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2Icon, PencilIcon, Trash2Icon, ExternalLinkIcon } from "lucide-react";
import type { Property } from "@/drizzle";

interface PropertiesTableProps {
  properties: Property[];
}

export function PropertiesTable({ properties }: PropertiesTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/dashboard/properties/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Delete failed");
      }
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No properties yet. Create one to get started.
              </TableCell>
            </TableRow>
          ) : (
            properties.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {p.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={p.status === "available" ? "default" : "outline"} className="capitalize">
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate">
                  {p.address ?? p.location ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/properties/${p.slug}`} target="_blank" rel="noopener noreferrer" aria-label="View">
                        <ExternalLinkIcon className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/properties/${p.id}/edit`} aria-label="Edit">
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deletingId === p.id}
                          aria-label="Delete"
                        >
                          {deletingId === p.id ? (
                            <Loader2Icon className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2Icon className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete property?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &ldquo;{p.title}&rdquo;. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(p.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
