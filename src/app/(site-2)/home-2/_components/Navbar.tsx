"use client";

import Logo from "@/components/shared/Logo";
import LogoLight from "@/components/shared/LogoLight";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SITE_2_NAV_LINKS } from "../site-2-nav";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/home-2";
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur-sm",
        isHome
          ? "border-white/10 bg-black/50 text-white"
          : "border-border bg-background/95 text-foreground",
      )}
    >
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <Link href="/home-2" className="shrink-0 text-sm font-semibold uppercase sm:text-base">
          {isHome ? <LogoLight /> : <Logo />}
        </Link>

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 lg:block"
          aria-label="Primary"
        >
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm">
            {SITE_2_NAV_LINKS.map((item) => (
              <li key={item.href + item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "transition-opacity duration-200 ease-out hover:opacity-100",
                    isHome ? "opacity-90" : "text-foreground/80 hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href="/contact"
            className={cn(
              "hidden items-center gap-2 border px-3 py-1.5 text-sm transition-opacity duration-200 ease-out hover:opacity-90 sm:flex",
              isHome ? "border-white/70" : "border-border",
            )}
          >
            <Phone className="size-4" aria-hidden />
            <span>Call us</span>
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("lg:hidden", isHome && "text-white hover:bg-white/10")}
                aria-label="Open menu"
              >
                <Menu className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,20rem)]">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-4" aria-label="Primary">
                {SITE_2_NAV_LINKS.map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="text-base font-medium"
                >
                  Call us
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
