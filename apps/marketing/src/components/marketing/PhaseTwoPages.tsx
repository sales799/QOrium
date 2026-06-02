import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Boxes,
  Building2,
  CheckCircle2,
  FileSearch,
  Fingerprint,
  IndianRupee,
  Layers3,
  LibraryBig,
  Network,
  Radar,
  Route,
  ShieldCheck,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';

import { FlickeringGrid } from '@/components/magicui/FlickeringGrid';
import { JdForgeDemo } from '@/components/interactive-proof/JdForgeDemo';
import { Reveal } from '@/components/motion/Reveal';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { MaxWidth } from '@/components/site/MaxWidth';
import { evidenceFlags } from '@/content/marketing-ia';
import {
  homeV2,
  platformProducts,
  type BuyerSolution,
  type Cta,
  type PlatformProduct,
  type ProductAccent,
} from '@/content/copy/phase2';
import { cn } from '@/lib/cn';

const accentStyles: Record<
  ProductAccent,
  {
    text: string;
    bg: string;
    border: string;
    icon: LucideIcon;
  }
> = {
  readybank: {
    text: 'text-signal-600',
    bg: 'bg-signal-100',
    border: 'border-signal-500/35',
    icon: LibraryBig,
  },
  'jd-forge': {
    text: 'text-product-500',
    bg: 'bg-product-100',
    border: 'border-product-500/35',
    icon: Sparkles,
  },
  'stack-vault': {
    text: 'text-india-700',
    bg: 'bg-india-100',
    border: 'border-india-500/40',
    icon: Boxes,
  },
};

function isVisibleCta(cta: Cta) {
  return !cta.flag || evidenceFlags[cta.flag];
}

function CtaRow({ ctas, dark = false }: { ctas: readonly Cta[]; dark?: boolean }) {
  const visibleCtas = ctas.filter(isVisibleCta);

  if (visibleCtas.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {visibleCtas.map((cta, index) => (
        <Link
          key={cta.href}
          href={cta.href}
          className={cn(
            'inline-flex min-h-11 items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors',
            index === 0
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border border-border bg-card text-foreground hover:border-secondary/60',
            dark && index === 0 ? 'bg-white text-primary hover:bg-white/90' : '',
            dark && index > 0
              ? 'border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]'
              : '',
          )}
        >
          {cta.label}
          <ArrowRight className="size-4" />
        </Link>
      ))}
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  dark?: boolean;
}) {
  return (
    <Reveal>
      <div className="mb-8 max-w-3xl">
        {eyebrow ? (
          <p
            className={cn(
              'font-mono text-xs font-semibold uppercase',
              dark ? 'text-signal-300' : 'text-secondary',
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={cn(
            'mt-3 text-balance text-3xl font-semibold md:text-5xl',
            dark ? 'text-white' : 'text-foreground',
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              'mt-4 max-w-2xl text-base leading-7',
              dark ? 'text-shell-muted' : 'text-muted-foreground',
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
    </Reveal>
  );
}

function EvidenceLedger() {
  const [header = [], ...rows] = homeV2.ledgerRows;

  return (
    <div className="mt-8 overflow-hidden rounded-lg border border-white/12 bg-white/[0.045]">
      <div className="grid gap-3 p-3 md:hidden">
        {rows.map((row) => (
          <div
            key={row.join('-')}
            className="rounded-md border border-white/10 bg-white/[0.04] p-4"
          >
            {row.map((cell, cellIndex) => (
              <div key={`${cell}-${cellIndex}`} className={cellIndex === 0 ? '' : 'mt-3'}>
                <p className="font-mono text-[0.68rem] font-semibold uppercase text-signal-300">
                  {header[cellIndex]}
                </p>
                <p className="mt-1 text-sm leading-6 text-shell-muted">{cell}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="hidden min-w-[38rem] grid-cols-[1fr_1fr_1fr] text-sm md:grid">
        {homeV2.ledgerRows.flatMap((row, rowIndex) =>
          row.map((cell, cellIndex) => (
            <div
              key={`${rowIndex}-${cellIndex}`}
              className={cn(
                'border-b border-r border-white/10 px-4 py-3 last:border-r-0',
                rowIndex === 0
                  ? 'font-mono text-xs font-semibold uppercase text-signal-300'
                  : 'text-shell-muted',
              )}
            >
              {cell}
            </div>
          )),
        )}
      </div>
    </div>
  );
}

function ProductGlyph({ accent }: { accent: ProductAccent }) {
  const style = accentStyles[accent];
  const Icon = style.icon;

  return (
    <span
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-md border',
        style.bg,
        style.border,
        style.text,
      )}
      aria-hidden="true"
    >
      <Icon className="size-5" />
    </span>
  );
}

function BulletList({ items, dark = false }: { items: readonly string[]; dark?: boolean }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-6">
          <CheckCircle2
            className={cn('mt-1 size-4 shrink-0', dark ? 'text-signal-300' : 'text-secondary')}
            aria-hidden="true"
          />
          <span className={dark ? 'text-shell-muted' : 'text-muted-foreground'}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function PricingTableBlock({ table }: { table: PlatformProduct['pricingTables'][number] }) {
  return (
    <Reveal className="min-w-0">
      <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border bg-muted px-4 py-3">
          <h3 className="text-base font-semibold">{table.title}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                {table.columns.map((column) => (
                  <th key={column} scope="col" className="px-4 py-3 font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={row.join('|')} className="border-b border-border last:border-b-0">
                  {row.map((cell, index) => (
                    <td
                      key={`${row[0]}-${cell}`}
                      className={cn(
                        'px-4 py-4 align-top',
                        index === 0 ? 'font-semibold text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Reveal>
  );
}

export function HomeV2Page() {
  return (
    <>
      <section className="surface-shell evidence-ledger relative isolate overflow-hidden border-b border-white/10">
        <FlickeringGrid
          className="absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(ellipse_at_top,black_0%,transparent_76%)]"
          squareSize={3}
          gridGap={6}
          flickerChance={0.12}
          maxOpacity={0.16}
          color="var(--secondary)"
        />
        <MaxWidth as="div" className="py-16 md:py-20">
          <Reveal>
            <div className="max-w-5xl">
              <p className="font-mono text-xs font-semibold uppercase text-signal-300">
                {homeV2.hero.eyebrow}
              </p>
              <h1 className="mt-5 max-w-5xl text-balance text-5xl font-semibold text-white md:text-7xl">
                {homeV2.hero.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-shell-muted">
                {homeV2.hero.description}
              </p>
              <div className="mt-8">
                <CtaRow ctas={[homeV2.hero.primaryCta, homeV2.hero.secondaryCta]} dark />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="max-w-4xl overflow-x-auto">
              <EvidenceLedger />
            </div>
          </Reveal>
        </MaxWidth>
      </section>

      <section className="surface-india border-b border-border py-16 md:py-20">
        <MaxWidth as="div">
          <SectionIntro
            eyebrow="Sitemap created from the live site"
            title="The marketing system now covers the complete public surface."
            description="Every major route family has a job: explain the platform, route the buyer, prove the moat, capture search demand, or reduce enterprise trust friction."
          />
          <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {homeV2.sitemap.map((family) => (
              <StaggerItem key={family.label}>
                <Link
                  href={family.href}
                  className="group block h-full rounded-lg border border-border bg-card p-5 transition-colors hover:border-india-500/50"
                >
                  <p className="font-mono text-xs font-semibold uppercase text-india-700">
                    {family.count}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold">{family.label}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{family.body}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-india-700">
                    Open route family
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      <section className="border-b border-border bg-background py-16 md:py-20">
        <MaxWidth as="div">
          <SectionIntro
            eyebrow={homeV2.villain.eyebrow}
            title={homeV2.villain.title}
            description={homeV2.villain.description}
          />
          <Stagger className="grid gap-4 md:grid-cols-3">
            {homeV2.villain.timeline.map((item) => (
              <StaggerItem key={item.label}>
                <div className="h-full rounded-lg border border-border bg-card p-5">
                  <p className="font-mono text-xs font-semibold uppercase text-secondary">
                    {item.label}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      <section className="surface-product border-b border-border py-16 md:py-20">
        <MaxWidth as="div">
          <SectionIntro
            eyebrow="Three products"
            title="One content engine, three buying motions."
            description="ReadyBank, JD-Forge, and Stack-Vault cover the path from shared library to JD-specific pack to private enterprise vault."
          />
          <Stagger className="grid gap-4 lg:grid-cols-3">
            {homeV2.products.map((product) => (
              <StaggerItem key={product.name}>
                <Link
                  href={product.href}
                  className="group block h-full rounded-lg border border-border bg-card p-5 transition-colors hover:border-secondary/60"
                >
                  <ProductGlyph accent={product.accent} />
                  <h3 className="mt-5 text-2xl font-semibold">{product.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{product.line}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-secondary">
                    Open product
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      <section className="border-b border-border bg-background py-16 md:py-20">
        <MaxWidth as="div">
          <SectionIntro
            eyebrow="Eight-dimension moat"
            title="The moat is visible when the lifecycle is visible."
            description="The redesign turns QOrium's content lifecycle into a scannable proof system instead of burying it in back-office language."
          />
          <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {homeV2.moat.map((dimension, index) => (
              <StaggerItem key={dimension}>
                <div className="flex min-h-28 flex-col justify-between rounded-lg border border-border bg-card p-4">
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="mt-5 text-base font-semibold">{dimension}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      <section className="surface-product border-b border-border py-16 md:py-20">
        <MaxWidth as="div">
          <SectionIntro
            eyebrow="Competitor and global benchmark research"
            title="QOrium's strongest position is defensible content infrastructure."
            description="The category already has polished assessment tools. QOrium wins when buyers see the lifecycle behind the bank: how content is authored, mapped, refreshed, protected, and explained."
          />
          <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {homeV2.benchmark.map((competitor) => (
              <StaggerItem key={competitor.name}>
                <div className="h-full rounded-lg border border-border bg-card p-5">
                  <p className="font-mono text-xs font-semibold uppercase text-secondary">
                    {competitor.name}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold">{competitor.signal}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {competitor.qoriumMove}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      <section className="surface-shell border-b border-white/10 py-16 md:py-20">
        <MaxWidth as="div">
          <SectionIntro
            eyebrow={homeV2.proofZone.eyebrow}
            title={homeV2.proofZone.title}
            description={homeV2.proofZone.description}
            dark
          />
          <Reveal>
            <JdForgeDemo compact dark />
          </Reveal>
        </MaxWidth>
      </section>

      <section className="surface-india border-b border-border py-16 md:py-20">
        <MaxWidth as="div">
          <SectionIntro
            eyebrow="Buyer routing"
            title="Different buyers need different proof paths."
            description="The homepage now routes platform leaders, GCC teams, and staffing firms into distinct conversion stories."
          />
          <Stagger className="grid gap-4 lg:grid-cols-3">
            {homeV2.buyers.map((buyer) => (
              <StaggerItem key={buyer.href}>
                <Link
                  href={buyer.href}
                  className="group block h-full rounded-lg border border-border bg-card p-5 transition-colors hover:border-india-500/50"
                >
                  <UsersRound className="size-5 text-india-700" />
                  <h3 className="mt-4 text-xl font-semibold">{buyer.label}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{buyer.body}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-india-700">
                    Open solution
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      <section className="surface-shell border-b border-white/10 py-16 md:py-20">
        <MaxWidth as="div">
          <SectionIntro
            eyebrow="Gap analysis closed"
            title="From broad sitemap to a connected buyer journey."
            description="The redesign closes the gap between what QOrium has built and what a global enterprise buyer needs to understand before booking."
            dark
          />
          <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {homeV2.gapClosure.map(([label, body]) => (
              <StaggerItem key={label}>
                <div className="h-full rounded-lg border border-white/12 bg-white/[0.055] p-5">
                  <p className="font-mono text-xs font-semibold uppercase text-signal-300">
                    {label}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-shell-muted">{body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      <section className="border-b border-border bg-background py-16 md:py-20">
        <MaxWidth as="div">
          <SectionIntro
            eyebrow="Evidence-gated trust"
            title="Proof modules render only when proof exists."
            description="This strip names the trust posture without showing logo rails, case studies, or outcome numbers ahead of evidence."
          />
          <Reveal>
            <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border border-border bg-card p-5">
                <ShieldCheck className="size-6 text-secondary" />
                <h3 className="mt-4 text-xl font-semibold">We show our work.</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  QOrium keeps trust claims behind source, flag, and feature-state checks.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <BulletList items={homeV2.trust} />
              </div>
            </div>
          </Reveal>
        </MaxWidth>
      </section>

      <section className="surface-shell py-14">
        <MaxWidth
          as="div"
          className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
        >
          <Reveal>
            <div>
              <h2 className="max-w-3xl text-3xl font-semibold text-white">
                {homeV2.finalCta.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-shell-muted">
                {homeV2.finalCta.description}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <CtaRow ctas={[homeV2.finalCta.primaryCta, homeV2.finalCta.secondaryCta]} dark />
          </Reveal>
        </MaxWidth>
      </section>
    </>
  );
}

function ProductHero({ product }: { product: PlatformProduct }) {
  const style = accentStyles[product.slug];
  const Icon = style.icon;

  return (
    <section className="surface-shell evidence-ledger relative isolate overflow-hidden border-b border-white/10">
      <FlickeringGrid
        className="absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black_0%,transparent_78%)]"
        squareSize={3}
        gridGap={6}
        flickerChance={0.1}
        maxOpacity={0.14}
        color="var(--secondary)"
      />
      <MaxWidth as="div" className="py-16 md:py-20">
        <Reveal>
          <div className="max-w-5xl">
            <span
              className={cn(
                'inline-flex size-12 items-center justify-center rounded-md border bg-white/[0.06]',
                style.border,
                style.text,
              )}
              aria-hidden="true"
            >
              <Icon className="size-6" />
            </span>
            <p className="mt-6 font-mono text-xs font-semibold uppercase text-signal-300">
              {product.eyebrow}
            </p>
            <h1 className="mt-4 max-w-5xl text-balance text-5xl font-semibold text-white md:text-7xl">
              {product.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-shell-muted">
              {product.description}
            </p>
            <div className="mt-8">
              <CtaRow
                ctas={
                  product.secondaryCta
                    ? [product.primaryCta, product.secondaryCta]
                    : [product.primaryCta]
                }
                dark
              />
            </div>
          </div>
        </Reveal>
      </MaxWidth>
    </section>
  );
}

export function PlatformProductPage({ product }: { product: PlatformProduct }) {
  return (
    <>
      <ProductHero product={product} />

      <section className="border-b border-border bg-background py-16 md:py-20">
        <MaxWidth as="div" className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionIntro title={product.problem.title} description={product.problem.body} />
          <Reveal delay={0.1}>
            <div className="rounded-lg border border-border bg-card p-5">
              <BulletList items={product.problem.bullets} />
            </div>
          </Reveal>
        </MaxWidth>
      </section>

      <section className="surface-product border-b border-border py-16 md:py-20">
        <MaxWidth as="div">
          <SectionIntro
            eyebrow="How it works"
            title={`${product.name} pipeline`}
            description="Each product page shows the buyer path from problem to package to CTA."
          />
          <Stagger className="grid gap-4 md:grid-cols-3">
            {product.workflow.map((step, index) => (
              <StaggerItem key={step.title}>
                <div className="h-full rounded-lg border border-border bg-card p-5">
                  <p className="font-mono text-xs font-semibold uppercase text-secondary">
                    Step {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      <section className="border-b border-border bg-background py-16 md:py-20">
        <MaxWidth as="div">
          <SectionIntro
            eyebrow="Proof posture"
            title="What this page can claim today"
            description="The page uses SKU and pricing copy, but evidence-gated proof modules stay hidden until the backing flag exists."
          />
          <Reveal>
            <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border border-border bg-card p-5">
                <BadgeCheck className="size-6 text-secondary" />
                <h3 className="mt-4 text-xl font-semibold">Evidence-gated selling</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  No customer badges, logos, or outcome numbers render from these product pages
                  without a live flag.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <BulletList items={product.proof} />
              </div>
            </div>
          </Reveal>
        </MaxWidth>
      </section>

      <section className="surface-india border-b border-border py-16 md:py-20">
        <MaxWidth as="div">
          <SectionIntro
            eyebrow="Pricing nod"
            title={product.pricingTitle}
            description={product.pricingIntro}
          />
          <div className="grid gap-5">
            {product.pricingTables.map((table) => (
              <PricingTableBlock key={table.title} table={table} />
            ))}
          </div>
        </MaxWidth>
      </section>

      <section className="border-b border-border bg-background py-16 md:py-20">
        <MaxWidth as="div">
          <SectionIntro eyebrow="Included" title={`What ${product.name} includes`} />
          <Reveal>
            <div className="rounded-lg border border-border bg-card p-5">
              <BulletList items={product.included} />
            </div>
          </Reveal>
        </MaxWidth>
      </section>

      <section className="surface-shell py-14">
        <MaxWidth
          as="div"
          className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
        >
          <Reveal>
            <div>
              <p className="font-mono text-xs font-semibold uppercase text-signal-300">
                {product.name}
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-white">
                Move from page read to buyer-fit walkthrough.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <CtaRow ctas={[product.primaryCta]} dark />
          </Reveal>
        </MaxWidth>
      </section>
    </>
  );
}

export function PlatformOverviewPage() {
  return (
    <>
      <section className="surface-shell evidence-ledger border-b border-white/10 py-16 md:py-20">
        <MaxWidth as="div">
          <Reveal>
            <p className="font-mono text-xs font-semibold uppercase text-signal-300">Platform</p>
            <h1 className="mt-4 max-w-5xl text-balance text-5xl font-semibold text-white md:text-7xl">
              Three product motions, one evidence-first content engine.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-shell-muted">
              ReadyBank, JD-Forge, and Stack-Vault map QOrium from shared content to custom JD packs
              to private enterprise libraries.
            </p>
          </Reveal>
        </MaxWidth>
      </section>
      <section className="surface-product py-16 md:py-20">
        <MaxWidth as="div">
          <SectionIntro
            eyebrow="Products"
            title="Choose the product by content ownership."
            description="Shared, job-specific, or customer-exclusive: the route determines the commercial motion."
          />
          <Stagger className="grid gap-4 lg:grid-cols-3">
            {Object.values(platformProducts).map((product) => (
              <StaggerItem key={product.slug}>
                <Link
                  href={product.route}
                  className="group block h-full rounded-lg border border-border bg-card p-5 transition-colors hover:border-secondary/60"
                >
                  <ProductGlyph accent={product.slug} />
                  <h2 className="mt-5 text-2xl font-semibold">{product.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {product.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-secondary">
                    Open page
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>
    </>
  );
}

export function BuyerSolutionPage({ solution }: { solution: BuyerSolution }) {
  return (
    <>
      <section className="surface-shell evidence-ledger relative isolate overflow-hidden border-b border-white/10">
        <FlickeringGrid
          className="absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black_0%,transparent_78%)]"
          squareSize={3}
          gridGap={6}
          flickerChance={0.09}
          maxOpacity={0.14}
          color="var(--secondary)"
        />
        <MaxWidth as="div" className="py-16 md:py-20">
          <Reveal>
            <div className="max-w-5xl">
              <span
                className="inline-flex size-12 items-center justify-center rounded-md border border-white/12 bg-white/[0.06] text-india-500"
                aria-hidden="true"
              >
                <Route className="size-6" />
              </span>
              <p className="mt-6 font-mono text-xs font-semibold uppercase text-signal-300">
                {solution.eyebrow}
              </p>
              <h1 className="mt-4 max-w-5xl text-balance text-5xl font-semibold text-white md:text-7xl">
                {solution.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-shell-muted">
                {solution.description}
              </p>
              <div className="mt-8">
                <CtaRow ctas={[solution.primaryCta, solution.secondaryCta]} dark />
              </div>
            </div>
          </Reveal>
        </MaxWidth>
      </section>

      <section className="border-b border-border bg-background py-16 md:py-20">
        <MaxWidth as="div" className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionIntro title={solution.pain.title} description={solution.pain.body} />
          <Reveal delay={0.1}>
            <div className="rounded-lg border border-border bg-card p-5">
              <BulletList items={solution.pain.bullets} />
            </div>
          </Reveal>
        </MaxWidth>
      </section>

      <section className="surface-product border-b border-border py-16 md:py-20">
        <MaxWidth as="div">
          <SectionIntro
            eyebrow="Matched SKU"
            title="Route the buyer to the product that matches ownership and urgency."
          />
          <Stagger className="grid gap-4 lg:grid-cols-3">
            {solution.matchedSkus.map((sku) => (
              <StaggerItem key={sku.href}>
                <Link
                  href={sku.href}
                  className="group block h-full rounded-lg border border-border bg-card p-5 transition-colors hover:border-secondary/60"
                >
                  <Layers3 className="size-5 text-secondary" />
                  <h3 className="mt-4 text-xl font-semibold">{sku.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{sku.fit}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-secondary">
                    Open product
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      <section className="border-b border-border bg-background py-16 md:py-20">
        <MaxWidth as="div">
          <SectionIntro
            eyebrow="Workflow"
            title="From buyer pain to commercial motion"
            description="Each solution page keeps the CTA specific to the buyer's operating model."
          />
          <Stagger className="grid gap-4 md:grid-cols-3">
            {solution.workflow.map((step, index) => (
              <StaggerItem key={step.title}>
                <div className="h-full rounded-lg border border-border bg-card p-5">
                  <p className="font-mono text-xs font-semibold uppercase text-secondary">
                    Stage {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </MaxWidth>
      </section>

      <section className="surface-india border-b border-border py-16 md:py-20">
        <MaxWidth as="div">
          <SectionIntro
            eyebrow="India credibility"
            title="Regional proof without unsupported logos."
            description="The page names the relevant India and GCC signals, while proof rails remain gated."
          />
          <Reveal>
            <div className="rounded-lg border border-border bg-card p-5">
              <BulletList items={solution.indiaProof} />
            </div>
          </Reveal>
        </MaxWidth>
      </section>

      <section className="surface-shell py-14">
        <MaxWidth
          as="div"
          className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
        >
          <Reveal>
            <div>
              <p className="font-mono text-xs font-semibold uppercase text-signal-300">
                Buyer route
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-white">
                Continue with the product path for this buyer.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <CtaRow ctas={[solution.primaryCta, solution.secondaryCta]} dark />
          </Reveal>
        </MaxWidth>
      </section>
    </>
  );
}

export const solutionIcons = {
  'assessment-platforms': Network,
  'enterprises-gcc': Building2,
  'staffing-firms': UsersRound,
} satisfies Record<BuyerSolution['slug'], LucideIcon>;

export const productIcons = {
  readybank: Banknote,
  'jd-forge': FileSearch,
  'stack-vault': Fingerprint,
  leak: Radar,
  india: IndianRupee,
} satisfies Record<string, LucideIcon>;
