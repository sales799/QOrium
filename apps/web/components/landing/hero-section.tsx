"use client";

import { BorderBeam } from "@/components/magicui/border-beam";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";

/**
 * Hero — locked merge alpha per REDESIGN-BRIEF.md sections 1+5 (sign-off 2026-05-08).
 * Right-column live mini-widget (ReadyBank seed-001) lands in P0-2.
 */
export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative mx-auto mt-32 max-w-[80rem] px-6 md:px-8"
    >
      <div className="grid gap-12 md:grid-cols-[3fr_2fr] md:items-center">
        <div className="text-center md:text-left">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary translate-y-[-1rem] animate-fade-in opacity-0">
            YOUR ASSESSMENT WAS BUILT BEFORE AI.
          </p>
          <h1 className="bg-gradient-to-br from-foreground from-30% to-foreground/40 bg-clip-text py-2 text-5xl font-bold leading-[1.05] tracking-tighter text-transparent text-balance sm:text-6xl md:text-7xl translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
            AI-proof technical assessment.
          </h1>
          <p className="mt-6 text-lg tracking-tight text-muted-foreground md:text-xl text-balance translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
            Built post-LLM. Per-candidate question variants. Real-time
            AI-plagiarism detection. Audit-defensible results.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 md:flex-row md:items-start translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
            <Button asChild className="rounded-lg gap-1 text-primary-foreground">
              <Link href="/book-a-demo">
                <span>Book a demo</span>
                <ArrowRightIcon className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-lg gap-1">
              <Link href="/method">
                <span>See the method</span>
                <ArrowRightIcon className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:800ms]">
            15-min demo · 10-day pilot · No card required.
          </p>
        </div>
        <div className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-xl border border-border bg-card/40 p-6 animate-fade-up opacity-0 [--animation-delay:600ms]">
          <BorderBeam size={180} duration={12} delay={2} colorFrom="var(--color-one)" colorTo="var(--color-two)" />
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
            <p className="font-mono text-xs uppercase tracking-wider">Live mini-widget</p>
            <p className="mt-2 text-sm">ReadyBank seed-001 mounts here (P0-2).</p>
            <p className="mt-6 text-[10px] opacity-60">watermark id · session-pending</p>
          </div>
        </div>
      </div>
    </section>
  );
}
