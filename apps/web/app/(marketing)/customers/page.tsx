import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers",
  description:
    "Customer Zero (Talpro) is the first to dogfood Qorium. Design partners welcome — three slots open.",
};

export default function CustomersPage() {
  return (
    <section className="mx-auto mt-32 max-w-4xl px-6 md:px-8">
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
        CUSTOMERS
      </p>
      <h1 className="text-5xl font-bold tracking-tighter md:text-6xl">
        Customer Zero is live.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Talpro is the first organisation hiring senior engineers through
        Qorium. The full Customer-Zero story (quote, sample report, numbers)
        lands in P1 once Sprint 1.2 closes.
      </p>
      <p className="mt-4 max-w-2xl text-base text-muted-foreground">
        Three design-partner slots open. Email{" "}
        <a className="text-primary underline" href="mailto:hello@qorium.online">
          hello@qorium.online
        </a>
        .
      </p>
    </section>
  );
}
