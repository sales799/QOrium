import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Qorium is built post-LLM by the team behind Talpro. Mission, founders, and investor hand-off.",
};

export default function AboutPage() {
  return (
    <section className="mx-auto mt-32 max-w-4xl px-6 md:px-8">
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
        ABOUT
      </p>
      <h1 className="text-5xl font-bold tracking-tighter md:text-6xl">
        Built post-LLM. By the team behind Talpro.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        The full mission, founder bios, and investor hand-off page land in P1.
        Investors and design partners can reach the team at{" "}
        <a className="text-primary underline" href="mailto:hello@qorium.online">
          hello@qorium.online
        </a>
        .
      </p>
    </section>
  );
}
