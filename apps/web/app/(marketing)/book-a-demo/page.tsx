import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a demo",
  description:
    "15-min demo of Qorium. 10-day pilot available. No card required.",
};

export default function BookADemoPage() {
  return (
    <section className="mx-auto mt-32 max-w-3xl px-6 text-center md:px-8">
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
        BOOK A DEMO
      </p>
      <h1 className="text-5xl font-bold tracking-tighter md:text-6xl">
        Let&apos;s show you the leak detector live.
      </h1>
      <p className="mt-6 mx-auto max-w-2xl text-lg text-muted-foreground">
        15-minute demo · 10-day pilot · No card required. Calendly /
        HubSpot embed lands in P0-4. For now, email{" "}
        <a className="text-primary underline" href="mailto:hello@qorium.online?subject=Qorium%20demo%20request">
          hello@qorium.online
        </a>{" "}
        and we&apos;ll send a slot within one business day.
      </p>
    </section>
  );
}
