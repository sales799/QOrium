import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Method",
  description:
    "How Qorium ships AI-proof assessment: Anti-Leak Engine, per-candidate Watermark, real-time AI Plagiarism Benchmark.",
};

export default function MethodPage() {
  return (
    <section className="mx-auto mt-32 max-w-4xl px-6 md:px-8">
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
        THE METHOD
      </p>
      <h1 className="text-5xl font-bold leading-[1.05] tracking-tighter md:text-6xl">
        Three mechanisms. One thesis: anti-cheat is the foundation, not a feature.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        This page is being filled in piece-by-piece against
        REDESIGN-BRIEF.md sections 4 and 5. The full Method narrative
        (Anti-Leak Engine · Watermark Engine · AI Plagiarism Benchmark, with
        diagrams and the four-step recruiter→candidate→result flow) lands in
        P0-5 of the v2 build.
      </p>
    </section>
  );
}
