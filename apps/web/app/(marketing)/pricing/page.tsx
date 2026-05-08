import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Pricing for Qorium — Talk to sales while we lock the model.",
};

export default function PricingPage() {
  return (
    <section className="mx-auto mt-32 max-w-4xl px-6 md:px-8">
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
        PRICING
      </p>
      <h1 className="text-5xl font-bold tracking-tighter md:text-6xl">
        Talk to sales.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Per-seat or per-assessment pricing, sized to your wave. The full
        three-tier matrix lands in P1 once the Customer-Zero pilot prices.
      </p>
      <div className="mt-10">
        <Button asChild className="rounded-lg text-primary-foreground">
          <Link href="/book-a-demo">Book a demo</Link>
        </Button>
      </div>
    </section>
  );
}
