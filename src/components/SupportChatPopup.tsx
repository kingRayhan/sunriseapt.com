"use client";

import { useState } from "react";
import { MessageCircleIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/** Build WhatsApp URL: wa.me/<digits only> */
function whatsappUrl(number: string): string {
  const digits = number.replace(/\D/g, "");
  if (!digits) return "#";
  return `https://wa.me/${digits}`;
}

export interface SupportChatPopupProps {
  messengerLink?: string | null;
  whatsappNumber?: string | null;
}

export function SupportChatPopup({
  messengerLink,
  whatsappNumber,
}: SupportChatPopupProps) {
  const [open, setOpen] = useState(false);
  const hasMessenger = Boolean(messengerLink?.trim());
  const hasWhatsApp = Boolean(whatsappNumber?.trim());

  if (!hasMessenger && !hasWhatsApp) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105"
          aria-label="Support chat options"
        >
          <MessageCircleIcon className="size-10" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        sideOffset={12}
        className="w-64 p-0"
      >
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">Chat with us</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-2">
          {hasMessenger && (
            <a
              href={messengerLink!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full overflow-hidden bg-muted">
                <img
                  src="/messenger.svg"
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                />
              </span>
              Messenger
            </a>
          )}
          {hasWhatsApp && (
            <a
              href={whatsappUrl(whatsappNumber!)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full overflow-hidden bg-muted">
                <img
                  src="/whatsapp.svg"
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                />
              </span>
              WhatsApp
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
