'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Download, Filter, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { type SamplePack, listSamplePacks } from '@/content/interactive-proof';
import { analyticsEvents, trackPlausible } from '@/lib/analytics';
import { cn } from '@/lib/cn';

export function SamplePackHub() {
  const packs = React.useMemo(() => listSamplePacks(), []);
  const families = React.useMemo(
    () => ['All', ...new Set(packs.map((pack) => pack.family))],
    [packs],
  );
  const [family, setFamily] = React.useState('All');
  const visible = family === 'All' ? packs : packs.filter((pack) => pack.family === family);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Filter className="size-4 text-secondary" />
        {families.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFamily(item)}
            className={cn(
              'rounded-md border px-3 py-2 text-sm font-semibold transition-colors',
              family === item
                ? 'border-secondary bg-accent text-accent-foreground'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((pack) => (
          <Link
            key={pack.slug}
            href={`/resources/sample-packs/${pack.slug}`}
            className="group flex min-h-72 flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-secondary/60"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-semibold uppercase text-secondary">
                  {pack.family}
                </p>
                <h2 className="mt-3 text-2xl font-semibold">{pack.title}</h2>
              </div>
              <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-semibold">
                {pack.itemCount} items
              </span>
            </div>
            <p className="mt-4 flex-1 text-sm leading-6 text-muted-foreground">{pack.summary}</p>
            <div className="mt-5 rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-muted-foreground">
              {pack.calibrationBadge}
            </div>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-secondary">
              Open pack
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SamplePackDetail({ pack }: { pack: SamplePack }) {
  const [email, setEmail] = React.useState('');
  const [company, setCompany] = React.useState('');
  const [role, setRole] = React.useState('');
  const [unlocked, setUnlocked] = React.useState<SamplePack | null>(null);
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'error'>('idle');

  async function unlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    try {
      const response = await fetch(`/v1/sample-packs/${pack.slug}/unlock`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, company, role }),
      });
      const payload = (await response.json()) as { data?: { pack: SamplePack } };
      if (!response.ok || !payload.data?.pack) throw new Error('unlock failed');
      setUnlocked(payload.data.pack);
      trackPlausible(analyticsEvents.samplePackUnlock, {
        pack_slug: pack.slug,
        pack_family: pack.family,
      });
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  const fullPack = unlocked ?? pack;
  const lockedCount = pack.itemCount - pack.previewItems.length;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div>
        <div className="grid gap-4">
          {pack.previewItems.map((item) => (
            <div key={item.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-xs font-semibold uppercase text-secondary">
                  {item.id}
                </p>
                <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs">
                  {item.format} / {item.difficulty}
                </span>
              </div>
              <h2 className="mt-3 text-xl font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.skillSignal}</p>
            </div>
          ))}
        </div>

        {unlocked ? (
          <div className="mt-8">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="size-5 text-secondary" />
              <h2 className="text-2xl font-semibold">Unlocked pack items</h2>
            </div>
            <div className="grid gap-4">
              {fullPack.gatedItems.map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-mono text-xs font-semibold uppercase text-secondary">
                      {item.id}
                    </p>
                    <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs">
                      {item.format} / {item.difficulty}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.skillSignal}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-border bg-muted p-5 text-sm text-muted-foreground">
            <LockKeyhole className="mb-3 size-5 text-secondary" />
            {lockedCount} additional items are gated behind email capture. The PDF is delivered by
            email.
          </div>
        )}
      </div>

      <aside className="h-fit rounded-lg border border-border bg-card p-5 lg:sticky lg:top-24">
        <p className="font-mono text-xs font-semibold uppercase text-secondary">Sample pack</p>
        <h2 className="mt-3 text-2xl font-semibold">{pack.title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{pack.summary}</p>
        <div className="mt-4 grid gap-2 text-sm">
          <Link
            href={pack.libraryHref}
            className="inline-flex items-center justify-between rounded-md border border-border px-3 py-2"
          >
            Skill page <ArrowRight className="size-4" />
          </Link>
          <Link
            href={pack.roleHref}
            className="inline-flex items-center justify-between rounded-md border border-border px-3 py-2"
          >
            Hiring route <ArrowRight className="size-4" />
          </Link>
          <Link
            href={pack.stackHref}
            className="inline-flex items-center justify-between rounded-md border border-border px-3 py-2"
          >
            Stack context <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-4 rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-muted-foreground">
          {pack.calibrationBadge}
        </div>

        {unlocked ? (
          <div className="mt-5 rounded-md border border-product-500/30 bg-product-100 p-3 text-sm text-foreground">
            <Download className="mb-2 size-4 text-product-500" />
            Full pack is visible. PDF delivery has been queued by email.
          </div>
        ) : (
          <form className="mt-5 grid gap-3" onSubmit={(event) => void unlock(event)}>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Work email"
              className="min-h-11 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-secondary"
            />
            <input
              required
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Company"
              className="min-h-11 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-secondary"
            />
            <input
              required
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="Role"
              className="min-h-11 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-secondary"
            />
            <Button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Unlock full pack
            </Button>
            {status === 'error' ? (
              <p className="text-sm text-danger">Could not unlock right now.</p>
            ) : null}
          </form>
        )}
      </aside>
    </div>
  );
}
