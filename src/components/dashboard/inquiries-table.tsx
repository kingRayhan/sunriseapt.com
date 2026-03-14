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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2Icon,
  Trash2Icon,
  EyeIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
} from "lucide-react";

const STATUS_OPTIONS = ["new", "read", "contacted", "closed"] as const;

export type InquiryListItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  propertyId: string | null;
  status: string;
  createdAt: Date | string;
  propertyTitle: string | null;
  propertySlug: string | null;
};

interface InquiriesTableProps {
  inquiries: InquiryListItem[];
}

function formatDate(d: Date | string): string {
  if (typeof d === "string") return new Date(d).toLocaleDateString("en-US");
  return d.toLocaleDateString("en-US");
}

export function InquiriesTable({ inquiries }: InquiriesTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryListItem | null>(
    null,
  );

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/dashboard/inquiries/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Delete failed");
      }
      router.refresh();
      setDetailOpen(false);
      setSelectedInquiry(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleStatusChange(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/dashboard/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Update failed");
      }
      router.refresh();
      if (selectedInquiry?.id === id) {
        setSelectedInquiry((prev) =>
          prev ? { ...prev, status } : null,
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  }

  function openDetail(inquiry: InquiryListItem) {
    setSelectedInquiry(inquiry);
    setDetailOpen(true);
  }

  const statusVariant = (status: string) => {
    if (status === "new") return "default";
    if (status === "closed") return "secondary";
    return "outline";
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No inquiries yet.
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((inq) => (
                <TableRow key={inq.id}>
                  <TableCell className="font-medium">{inq.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <a
                      href={`mailto:${inq.email}`}
                      className="hover:underline"
                    >
                      {inq.email}
                    </a>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {inq.message}
                  </TableCell>
                  <TableCell>
                    {inq.propertySlug && inq.propertyTitle ? (
                      <Button variant="link" className="h-auto p-0" asChild>
                        <Link
                          href={`/properties/${inq.propertySlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="truncate max-w-[120px] inline-block align-bottom">
                            {inq.propertyTitle}
                          </span>
                          <ExternalLinkIcon className="ml-1 h-3 w-3 shrink-0 inline" />
                        </Link>
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1"
                          disabled={updatingId === inq.id}
                        >
                          {updatingId === inq.id ? (
                            <Loader2Icon className="h-4 w-4 animate-spin" />
                          ) : (
                            <Badge variant={statusVariant(inq.status)} className="font-normal">
                              {inq.status}
                            </Badge>
                          )}
                          <ChevronDownIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {STATUS_OPTIONS.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleStatusChange(inq.id, status)}
                          >
                            {status}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(inq.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDetail(inq)}
                        aria-label="View"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deletingId === inq.id}
                            aria-label="Delete"
                          >
                            {deletingId === inq.id ? (
                              <Loader2Icon className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2Icon className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete inquiry?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the inquiry from{" "}
                              {inq.name}. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(inq.id)}
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

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Inquiry from {selectedInquiry?.name}</SheetTitle>
            <SheetDescription>
              {selectedInquiry?.email}
              {selectedInquiry?.phone && ` · ${selectedInquiry.phone}`}
            </SheetDescription>
          </SheetHeader>
          {selectedInquiry && (
            <div className="mt-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Status
                </h4>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-between">
                      {updatingId === selectedInquiry.id ? (
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                      ) : (
                        selectedInquiry.status
                      )}
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {STATUS_OPTIONS.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() =>
                          handleStatusChange(selectedInquiry.id, status)
                        }
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {selectedInquiry.propertySlug && selectedInquiry.propertyTitle && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Property
                  </h4>
                  <Button variant="link" className="h-auto p-0" asChild>
                    <Link
                      href={`/properties/${selectedInquiry.propertySlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selectedInquiry.propertyTitle}
                      <ExternalLinkIcon className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              )}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Message
                </h4>
                <p className="text-sm whitespace-pre-wrap rounded-md border bg-muted/50 p-3">
                  {selectedInquiry.message}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Received {formatDate(selectedInquiry.createdAt)}
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  handleDelete(selectedInquiry.id);
                }}
                disabled={deletingId === selectedInquiry.id}
              >
                {deletingId === selectedInquiry.id ? (
                  <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Delete inquiry
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
