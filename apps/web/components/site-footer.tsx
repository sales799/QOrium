import Link from "next/link";

/* Footer per REDESIGN-BRIEF.md section 3 (locked 2026-05-08). */
const cols = [
  {
    label: "Product",
    items: [
      { href: "/method", name: "Method" },
      { href: "/pricing", name: "Pricing" },
      { href: "/customers", name: "Customers" },
      { href: "/changelog", name: "Changelog" },
    ],
  },
  {
    label: "Company",
    items: [
      { href: "/about", name: "About" },
      { href: "/careers", name: "Careers" },
      { href: "/investors", name: "Investors" },
      { href: "mailto:hello@qorium.online", name: "Contact" },
    ],
  },
  {
    label: "Trust",
    items: [
      { href: "/security", name: "Security" },
      { href: "/privacy", name: "Privacy" },
      { href: "/dpa", name: "DPA" },
      { href: "/security#soc2", name: "SOC2 (in progress)" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="mx-auto w-full max-w-7xl px-6 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-[2fr_3fr]">
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="font-mono text-base text-primary">Q</span>
              <span>Qorium</span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              AI-proof technical assessment. Built post-LLM.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {cols.map((c) => (
              <div key={c.label}>
                <h2 className="mb-4 text-xs font-medium tracking-wider uppercase text-foreground/80">
                  {c.label}
                </h2>
                <ul className="grid gap-2">
                  {c.items.map((it) => (
                    <li key={it.name}>
                      <Link
                        href={it.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {it.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Qorium · made by Talpro
          </p>
          <p className="text-xs text-muted-foreground">
            Design partners welcome — three slots open.
          </p>
        </div>
      </div>
    </footer>
  );
}
