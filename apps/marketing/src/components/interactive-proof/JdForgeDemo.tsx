'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Download,
  Fingerprint,
  Loader2,
  PencilLine,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  type JdForgeDemoResult,
  runJdForgeFromJobTitle,
  sampleJds,
} from '@/content/interactive-proof';
import { analyticsEvents, trackPlausible } from '@/lib/analytics';
import { cn } from '@/lib/cn';

const DEFAULT_JOB_TITLE = 'Network Engineer / IT Infrastructure & Support';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function HighlightedJd({ text, phrases }: { text: string; phrases: string[] }) {
  const visiblePhrases = phrases.filter((phrase) => phrase.length > 2).slice(0, 24);
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

function formatInputFingerprint(value: string): string {
  const fingerprint = value.replace(/^sha256:/, '');
  return `${fingerprint.slice(0, 12)}...`;
}

export function JdForgeDemo({
  compact = false,
  dark = false,
}: {
  compact?: boolean;
  dark?: boolean;
}) {
  const initialResult = React.useMemo(() => runJdForgeFromJobTitle(DEFAULT_JOB_TITLE), []);
  const [inputMode, setInputMode] = React.useState<'job-title' | 'jd'>('job-title');
  const [jobTitle, setJobTitle] = React.useState(DEFAULT_JOB_TITLE);
  const [generatedJobTitle, setGeneratedJobTitle] = React.useState(DEFAULT_JOB_TITLE);
  const [jdText, setJdText] = React.useState(initialResult.source.generatedJd);
  const [generatedText, setGeneratedText] = React.useState(initialResult.source.generatedJd);
  const [result, setResult] = React.useState<JdForgeDemoResult>(initialResult);
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'error'>('idle');
  const [email, setEmail] = React.useState('');
  const [pdfState, setPdfState] = React.useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const normalizedEmail = email.trim();
  const normalizedJobTitle = jobTitle.trim();
  const normalizedJdText = jdText.trim();
  const canGenerate =
    inputMode === 'job-title' ? normalizedJobTitle.length >= 3 : normalizedJdText.length >= 20;
  const isDraftStale =
    inputMode === 'job-title'
      ? normalizedJobTitle !== generatedJobTitle.trim()
      : normalizedJdText !== generatedText.trim();
  const canRequestPdf = !isDraftStale && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  const phrases = React.useMemo(
    () => result.skills.flatMap((skill) => skill.sourcePhrases),
    [result.skills],
  );

  function updateDraft(nextText: string) {
    setInputMode('jd');
    setJdText(nextText);
    setStatus('idle');
    setPdfState('idle');
  }

  function updateJobTitle(nextTitle: string) {
    setJobTitle(nextTitle);
    setStatus('idle');
    setPdfState('idle');
  }

  async function runDemo() {
    const submittedTitle = normalizedJobTitle;
    const submittedText = normalizedJdText;
    if (inputMode === 'job-title' && submittedTitle.length < 3) return;
    if (inputMode === 'jd' && submittedText.length < 20) return;

    setStatus('loading');
    trackPlausible(analyticsEvents.jdForgeDemoStart, { mode: inputMode });
    try {
      const response = await fetch('/v1/jd-forge/demo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(
          inputMode === 'job-title' ? { job_title: submittedTitle } : { jd_text: submittedText },
        ),
      });
      const payload = (await response.json()) as { ok: boolean; data?: JdForgeDemoResult };
      if (!response.ok || !payload.data) throw new Error('demo failed');
      setResult(payload.data);
      if (inputMode === 'job-title') {
        const generatedJd = payload.data.source.generatedJd;
        setGeneratedJobTitle(submittedTitle);
        setJdText(generatedJd);
        setGeneratedText(generatedJd);
      } else {
        setGeneratedText(submittedText);
        setGeneratedJobTitle('');
      }
      setPdfState('idle');
      setStatus('idle');
      trackPlausible(analyticsEvents.jdForgeDemoComplete, {
        mode: inputMode,
        skill_count: payload.data.skills.length,
        item_count: payload.data.assessment.itemCount,
      });
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
              Build plan
            </p>
          </div>
          <div
            className={cn(
              'mt-4 grid grid-cols-2 rounded-md border p-1 text-xs font-semibold',
              dark ? 'border-white/10 bg-black/20' : 'border-border bg-background',
            )}
            role="tablist"
            aria-label="JD-Forge input mode"
          >
            {[
              { id: 'job-title' as const, label: 'Job title' },
              { id: 'jd' as const, label: 'Paste JD' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                role="tab"
                aria-selected={inputMode === mode.id}
                onClick={() => {
                  setInputMode(mode.id);
                  setStatus('idle');
                  setPdfState('idle');
                }}
                className={cn(
                  'rounded px-2 py-1.5 transition-colors',
                  inputMode === mode.id
                    ? dark
                      ? 'bg-signal-300/15 text-white'
                      : 'bg-secondary/10 text-foreground'
                    : dark
                      ? 'text-shell-muted hover:text-white'
                      : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>
          {inputMode === 'job-title' ? (
            <>
              <label className="mt-4 block text-sm font-medium" htmlFor="jd-demo-title">
                Job title
              </label>
              <input
                id="jd-demo-title"
                value={jobTitle}
                onChange={(event) => {
                  updateJobTitle(event.target.value);
                }}
                placeholder="Network Engineer, AI Product Manager, SAP MM Consultant"
                className={cn(
                  'mt-2 min-h-11 w-full rounded-md border px-3 text-sm outline-none focus:ring-2',
                  dark
                    ? 'border-white/10 bg-black/20 text-white focus:ring-signal-300'
                    : 'border-border bg-background focus:ring-secondary',
                )}
              />
              {normalizedJobTitle.length > 0 && normalizedJobTitle.length < 3 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Add at least 3 characters to research the role.
                </p>
              ) : null}
            </>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {sampleJds.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  setInputMode('jd');
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
            {inputMode === 'job-title' ? 'Generated job description' : 'Job description'}
          </label>
          <textarea
            ref={textareaRef}
            id="jd-demo-textarea"
            value={jdText}
            onChange={(event) => {
              updateDraft(event.target.value);
            }}
            placeholder={
              inputMode === 'job-title'
                ? 'Research output appears here after the title is generated.'
                : 'Paste a job description with role, skills, stack, tools, and seniority.'
            }
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
            ) : inputMode === 'job-title' ? (
              <Search className="size-4" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {inputMode === 'job-title'
              ? 'Research title and publish plan'
              : 'Generate assessment plan'}
          </Button>
          {inputMode === 'jd' && normalizedJdText.length > 0 && !canGenerate ? (
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
          {!isDraftStale && result.source.mode === 'job-title' ? (
            <div className="mt-3 rounded-md border border-secondary/40 bg-secondary/10 p-3 text-sm">
              Research draft published from {result.source.jobTitle}. Signals:{' '}
              {result.source.researchSignals.slice(0, 3).join(', ')}.
            </div>
          ) : null}
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
          <h2 className="mt-2 text-base font-semibold">{result.roleTitle}</h2>
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
              'mt-4 flex items-start gap-2 rounded-md border p-3 text-xs',
              dark ? 'text-shell-muted' : 'text-muted-foreground',
              dark ? 'border-white/10 bg-white/[0.035]' : 'border-border bg-background',
            )}
          >
            <Fingerprint className="mt-0.5 size-3.5 shrink-0" />
            <span>
              <span className={cn('font-semibold', dark ? 'text-white' : 'text-foreground')}>
                Plan evidence:
              </span>{' '}
              {result.planId} / {result.source.label} / input fingerprint{' '}
              {formatInputFingerprint(result.inputHash)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
