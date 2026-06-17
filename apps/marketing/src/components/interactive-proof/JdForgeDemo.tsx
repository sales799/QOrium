'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Download,
  FileText,
  Loader2,
  PencilLine,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { type JdForgeDemoResult, runJdForgeDemo, sampleJds } from '@/content/interactive-proof';
import { cn } from '@/lib/cn';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function HighlightedJd({ text, phrases }: { text: string; phrases: string[] }) {
  const visiblePhrases = phrases.filter((phrase) => phrase.length > 2).slice(0, 14);
  if (visiblePhrases.length === 0) {
    return <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{text}</p>;
  }

  const matcher = new RegExp(`(${visiblePhrases.map(escapeRegExp).join('|')})`, 'gi');
  const parts = text.split(matcher);

  return (
    <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
      {parts.map((part, index) =>
        visiblePhrases.some((phrase) => phrase.toLowerCase() === part.toLowerCase()) ? (
          <mark key={`${part}-${index}`} className="rounded-sm bg-product-100 px-1 text-foreground">
            {part}
          </mark>
        ) : (
          <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
        ),
      )}
    </p>
  );
}

export function JdForgeDemo({
  compact = false,
  dark = false,
}: {
  compact?: boolean;
  dark?: boolean;
}) {
  const [jdText, setJdText] = React.useState(sampleJds[0]!.body);
  const [generatedText, setGeneratedText] = React.useState(sampleJds[0]!.body);
  const [result, setResult] = React.useState<JdForgeDemoResult>(() =>
    runJdForgeDemo(sampleJds[0]!.body),
  );
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'error'>('idle');
  const [email, setEmail] = React.useState('');
  const [pdfState, setPdfState] = React.useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const normalizedEmail = email.trim();
  const normalizedJdText = jdText.trim();
  const canGenerate = normalizedJdText.length >= 20;
  const isDraftStale = normalizedJdText !== generatedText.trim();
  const canRequestPdf = !isDraftStale && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  const phrases = React.useMemo(
    () => result.skills.flatMap((skill) => skill.sourcePhrases),
    [result.skills],
  );

  function updateDraft(nextText: string) {
    setJdText(nextText);
    setStatus('idle');
    setPdfState('idle');
  }

  async function runDemo(nextText = jdText) {
    const submittedText = nextText.trim();
    if (submittedText.length < 20) return;

    setStatus('loading');
    try {
      const response = await fetch('/v1/jd-forge/demo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jd_text: submittedText }),
      });
      const payload = (await response.json()) as { ok: boolean; data?: JdForgeDemoResult };
      if (!response.ok || !payload.data) throw new Error('demo failed');
      setResult(payload.data);
      setGeneratedText(submittedText);
      setPdfState('idle');
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  async function requestPdf() {
    if (!canRequestPdf) return;
    setPdfState('loading');
    try {
      const response = await fetch('/v1/jd-forge/demo/plan-pdf', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, plan_id: result.planId }),
      });
      if (!response.ok) throw new Error('pdf failed');
      setPdfState('sent');
    } catch {
      setPdfState('error');
    }
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border',
        dark ? 'border-white/10 bg-white/[0.045] text-white' : 'border-border bg-card',
      )}
    >
      <div className={cn('grid gap-0', compact ? 'lg:grid-cols-[0.9fr_1.1fr]' : 'lg:grid-cols-3')}>
        <div
          className={cn(
            'border-b p-4 lg:border-b-0 lg:border-r',
            dark ? 'border-white/10' : 'border-border',
          )}
        >
          <div className="flex items-center gap-2">
            <Sparkles className={cn('size-4', dark ? 'text-signal-300' : 'text-secondary')} />
            <p
              className={cn(
                'font-mono text-xs font-semibold uppercase',
                dark ? 'text-signal-300' : 'text-secondary',
              )}
            >
              Live JD to test
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {sampleJds.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  updateDraft(sample.body);
                }}
                className={cn(
                  'rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors',
                  sample.body === jdText
                    ? dark
                      ? 'border-signal-300/50 bg-signal-300/10 text-white'
                      : 'border-secondary/60 bg-secondary/10 text-foreground'
                    : dark
                      ? 'border-white/10 bg-white/[0.04] text-shell-muted hover:text-white'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground',
                )}
              >
                {sample.title}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                updateDraft('');
                window.requestAnimationFrame(() => textareaRef.current?.focus());
              }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors',
                jdText.length === 0
                  ? dark
                    ? 'border-signal-300/50 bg-signal-300/10 text-white'
                    : 'border-secondary/60 bg-secondary/10 text-foreground'
                  : dark
                    ? 'border-white/10 bg-white/[0.04] text-shell-muted hover:text-white'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground',
              )}
            >
              <PencilLine className="size-3.5" />
              Custom JD
            </button>
          </div>
          <label className="mt-4 block text-sm font-medium" htmlFor="jd-demo-textarea">
            Job description
          </label>
          <textarea
            ref={textareaRef}
            id="jd-demo-textarea"
            value={jdText}
            onChange={(event) => {
              updateDraft(event.target.value);
            }}
            placeholder="Paste a job description with role, skills, stack, tools, and seniority."
            className={cn(
              'mt-2 min-h-44 w-full resize-y rounded-md border p-3 text-sm leading-6 outline-none focus:ring-2',
              dark
                ? 'border-white/10 bg-black/20 text-white focus:ring-signal-300'
                : 'border-border bg-background focus:ring-secondary',
            )}
          />
          <Button
            className="mt-3 w-full"
            type="button"
            onClick={() => void runDemo()}
            disabled={status === 'loading' || !canGenerate}
          >
            {status === 'loading' ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Generate assessment plan
          </Button>
          {normalizedJdText.length > 0 && !canGenerate ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Add at least 20 characters to generate an assessment plan.
            </p>
          ) : null}
          {status === 'error' ? (
            <p className="mt-2 text-sm text-danger">
              The live demo endpoint did not respond. Try again.
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            'border-b p-4 lg:border-b-0 lg:border-r',
            dark ? 'border-white/10' : 'border-border',
          )}
        >
          <p
            className={cn(
              'font-mono text-xs font-semibold uppercase',
              dark ? 'text-signal-300' : 'text-secondary',
            )}
          >
            Extracted skills
          </p>
          {isDraftStale ? (
            <div className="mt-3 rounded-md border border-secondary/40 bg-secondary/10 p-3 text-sm">
              Draft changed. Generate assessment plan to refresh the extracted skills.
            </div>
          ) : result.lowConfidenceReason ? (
            <div className="mt-3 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
              {result.lowConfidenceReason}
            </div>
          ) : null}
          <div className="mt-4 max-h-[26rem] overflow-y-auto pr-1">
            <HighlightedJd text={generatedText} phrases={phrases} />
          </div>
          <div className="mt-4 grid gap-2">
            {result.skills.map((skill) => (
              <Link
                key={skill.name}
                href={skill.libraryHref}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-md border p-3 text-sm transition-colors',
                  dark
                    ? 'border-white/10 bg-white/[0.035] hover:bg-white/[0.07]'
                    : 'border-border bg-background hover:border-secondary/60',
                )}
              >
                <span>
                  <span className="block font-semibold">{skill.name}</span>
                  <span
                    className={cn('text-xs', dark ? 'text-shell-muted' : 'text-muted-foreground')}
                  >
                    {skill.stackFamily} / {Math.round(skill.weight * 100)}% weight
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        <div className="p-4">
          <p
            className={cn(
              'font-mono text-xs font-semibold uppercase',
              dark ? 'text-india-500' : 'text-secondary',
            )}
          >
            Your assessment
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
            <div
              className={cn(
                'rounded-md border p-3',
                dark ? 'border-white/10 bg-white/[0.04]' : 'border-border bg-background',
              )}
            >
              <span className="block text-2xl font-semibold">{result.assessment.itemCount}</span>
              items
            </div>
            <div
              className={cn(
                'rounded-md border p-3',
                dark ? 'border-white/10 bg-white/[0.04]' : 'border-border bg-background',
              )}
            >
              <span className="block text-2xl font-semibold">
                {result.assessment.durationMinutes}
              </span>
              minutes
            </div>
            <div
              className={cn(
                'rounded-md border p-3',
                dark ? 'border-white/10 bg-white/[0.04]' : 'border-border bg-background',
              )}
            >
              <span className="block text-2xl font-semibold">{result.skills.length}</span>
              skills
            </div>
          </div>
          <div className="mt-4 rounded-md border border-product-500/30 bg-product-100 p-3 text-sm text-foreground">
            <ShieldCheck className="mb-2 size-4 text-product-500" />
            {result.assessment.coverageBadge}
          </div>
          <div className="mt-4 space-y-2">
            {result.assessment.formats.map((format) => (
              <div key={format.label} className="flex items-center justify-between text-sm">
                <span className={dark ? 'text-shell-muted' : 'text-muted-foreground'}>
                  {format.label}
                </span>
                <span className="font-semibold">{format.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-2">
            {isDraftStale ? (
              <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-muted px-4 py-2.5 text-sm font-semibold text-muted-foreground">
                Book a demo with this plan
                <ArrowRight className="size-4" />
              </span>
            ) : (
              <Link
                href={`/demo?plan=${result.planId}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Book a demo with this plan
                <ArrowRight className="size-4" />
              </Link>
            )}
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setPdfState('idle');
                }}
                type="email"
                placeholder="work email"
                className={cn(
                  'min-h-11 rounded-md border px-3 text-sm outline-none focus:ring-2',
                  dark
                    ? 'border-white/10 bg-black/20 text-white focus:ring-signal-300'
                    : 'border-border bg-background focus:ring-secondary',
                )}
                aria-label="Work email for assessment PDF"
                aria-describedby="jd-demo-pdf-help"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => void requestPdf()}
                disabled={!canRequestPdf || pdfState === 'loading'}
              >
                {pdfState === 'loading' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                PDF
              </Button>
            </div>
            <p
              id="jd-demo-pdf-help"
              className={cn(
                'text-xs',
                pdfState === 'error'
                  ? 'text-danger'
                  : dark
                    ? 'text-shell-muted'
                    : 'text-muted-foreground',
              )}
            >
              {pdfState === 'sent'
                ? 'Plan PDF queued for email delivery.'
                : pdfState === 'error'
                  ? 'Could not queue the PDF.'
                  : isDraftStale
                    ? 'Generate the current draft to enable PDF delivery.'
                    : 'Enter a valid work email to enable PDF delivery.'}
            </p>
          </div>
          <div
            className={cn(
              'mt-4 flex items-center gap-2 text-xs',
              dark ? 'text-shell-muted' : 'text-muted-foreground',
            )}
          >
            <FileText className="size-3.5" />
            Plan ID {result.planId} / input {result.inputHash.slice(0, 18)}
          </div>
        </div>
      </div>
    </div>
  );
}
