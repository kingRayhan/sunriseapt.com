"use client";

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
import { useEffect, useState } from "react";
import { SITE_2_NAV_LINKS } from "../site-2-nav";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 w-full text-white",
        scrolled
          ? "border-b border-white/10 bg-black/70 supports-[backdrop-filter]:bg-black/40 supports-[backdrop-filter]:backdrop-blur"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div
        className="container mx-auto flex items-center gap-4 px-4 py-3 lg:px-8"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <Link href="/" className="shrink-0" aria-label="Go to home">
          <LogoLight />
        </Link>

        <nav
          className="hidden flex-1 justify-center lg:flex"
          aria-label="Primary"
        >
          <ul className="flex items-center gap-7 text-sm">
            {SITE_2_NAV_LINKS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
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
            href="/contact"
            className={cn(
              "hidden items-center gap-2 rounded-sm border px-3 py-1.5 text-xs font-medium transition-opacity duration-200 ease-out hover:opacity-90 sm:flex",
              "border-white/70 bg-white/5 text-white",
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
                  "text-white hover:bg-white/10",
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
                  href="/contact"
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
