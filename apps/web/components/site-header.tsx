"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import { AlignJustify, XIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

/* IA per REDESIGN-BRIEF.md section 3 (5-page flat, Linear precedent), locked 2026-05-08. */
const menuItem = [
  { id: 1, label: "Method", href: "/method" },
  { id: 2, label: "Pricing", href: "/pricing" },
  { id: 3, label: "Customers", href: "/customers" },
  { id: 4, label: "About", href: "/about" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const html = document.querySelector("html");
    if (html) html.classList.toggle("overflow-hidden", open);
  }, [open]);
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("orientationchange", close);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("orientationchange", close);
      window.removeEventListener("resize", close);
    };
  }, []);

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full px-4 animate-fade-in border-b border-border/60 opacity-0 backdrop-blur-[12px] [--animation-delay:600ms]">
        <div className="container mx-auto flex h-[var(--navigation-height)] w-full items-center justify-between">
          <Link className="flex items-center gap-2 font-semibold tracking-tight" href="/">
            <span className="font-mono text-base text-primary">Q</span>
            <span>Qorium</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            {menuItem.map((it) => (
              <Link key={it.id} href={it.href} className="transition-colors hover:text-foreground">
                {it.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center">
            <Button asChild size="sm" className="rounded-lg gap-1 text-primary-foreground">
              <Link href="/book-a-demo">
                Book a demo <ArrowRightIcon className="size-3" />
              </Link>
            </Button>
          </div>
          <button className="ml-6 md:hidden" onClick={() => setOpen((o) => !o)}>
            <span className="sr-only">Toggle menu</span>
            {open ? <XIcon /> : <AlignJustify />}
          </button>
        </div>
      </header>
      <AnimatePresence>
        <motion.nav
          initial={{ opacity: 0 }}
          animate={open ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed left-0 top-0 z-40 h-screen w-full overflow-auto bg-background/85 backdrop-blur-[12px]",
            !open && "pointer-events-none",
          )}
        >
          <div className="container mx-auto flex h-[var(--navigation-height)] items-center justify-between">
            <Link className="flex items-center gap-2 font-semibold" href="/">
              <span className="font-mono text-primary">Q</span>
              <span>Qorium</span>
            </Link>
          </div>
          <ul className="flex flex-col">
            {menuItem.map((it) => (
              <li key={it.id} className="border-b border-border/40 px-6 py-2">
                <Link href={it.href} className="flex h-12 w-full items-center text-lg" onClick={() => setOpen(false)}>
                  {it.label}
                </Link>
              </li>
            ))}
            <li className="px-6 py-4">
              <Button asChild className="w-full rounded-lg gap-1 text-primary-foreground">
                <Link href="/book-a-demo" onClick={() => setOpen(false)}>
                  Book a demo <ArrowRightIcon className="size-3" />
                </Link>
              </Button>
            </li>
          </ul>
        </motion.nav>
      </AnimatePresence>
    </>
  );
}
