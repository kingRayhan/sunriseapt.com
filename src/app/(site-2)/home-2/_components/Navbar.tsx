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
        "z-50 w-full",
        isHome ? "absolute inset-x-0 top-0" : "sticky top-0",
        isHome
          ? "border-b border-white/10 bg-black/30 text-white"
          : "border-b border-border bg-background text-foreground",
      )}
    >
      <div className="container mx-auto flex items-center gap-4 px-4 py-3 lg:px-8">
        <Link href="/home-2" className="shrink-0" aria-label="Go to home">
          {isHome ? <LogoLight /> : <Logo />}
        </Link>

        <nav
          className="hidden flex-1 justify-center lg:flex"
          aria-label="Primary"
        >
          <ul className="flex items-center gap-7 text-sm">
            {SITE_2_NAV_LINKS.map((item) => {
              const active =
                item.href === "/home-2"
                  ? pathname === "/home-2"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href + item.label}>
                  <Link
                    href={item.href}
                    className={cn(
                      "rounded-sm px-2 py-1 text-xs font-medium transition-colors duration-200 ease-out",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href="/home-2/contact"
            className={cn(
              "hidden items-center gap-2 rounded-sm border px-3 py-1.5 text-xs font-medium transition-opacity duration-200 ease-out hover:opacity-90 sm:flex",
              isHome
                ? "border-white/70 bg-white/5 text-white"
                : "border-border text-foreground",
            )}
          >
            <Phone className="size-4" aria-hidden />
            <span>Contact us</span>
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "lg:hidden",
                  isHome && "text-white hover:bg-white/10",
                )}
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
                  href="/home-2/contact"
                  onClick={() => setOpen(false)}
                  className="text-base font-medium"
                >
                  Contact us
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
