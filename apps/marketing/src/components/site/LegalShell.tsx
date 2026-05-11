import * as React from 'react';

interface LegalShellProps {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}

export function LegalShell({ title, effectiveDate, children }: LegalShellProps) {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <header className="not-prose mb-10 space-y-2 border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Legal</p>
        <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">Effective {effectiveDate}</p>
      </header>
      <div className="not-prose mb-8 rounded-md border border-warning/40 bg-warning/5 p-4 text-sm text-warning">
        Pre-launch: this document is under counsel review. The structure below reflects our intended
        posture; final binding language will replace it before public launch.
      </div>
      <div className="space-y-6 font-serif text-base leading-relaxed text-foreground/90">
        {children}
      </div>
    </article>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-sans text-xl font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}
