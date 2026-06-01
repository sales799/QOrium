'use client';

import * as React from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronDown, Copy, Loader2, ThumbsDown, ThumbsUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  type GraderExemplar,
  getGraderExemplar,
  listGraderExemplars,
} from '@/content/interactive-proof';
import { cn } from '@/lib/cn';

type ExemplarSummary = ReturnType<typeof listGraderExemplars>[number];

export function GradedAnswerViewer({
  skillFilter,
  embedded = false,
}: {
  skillFilter?: string;
  embedded?: boolean;
}) {
  const exemplars = React.useMemo(() => {
    const filtered = listGraderExemplars(skillFilter);
    return filtered.length > 0 ? filtered : listGraderExemplars();
  }, [skillFilter]);
  const [selected, setSelected] = React.useState<ExemplarSummary>(exemplars[0]!);
  const [detail, setDetail] = React.useState<GraderExemplar>(
    () => getGraderExemplar(exemplars[0]!.id)!,
  );
  const [loading, setLoading] = React.useState(false);
  const [expanded, setExpanded] = React.useState(!embedded);
  const [voteState, setVoteState] = React.useState<'idle' | 'sent' | 'error'>('idle');

  async function selectExemplar(exemplar: ExemplarSummary) {
    setSelected(exemplar);
    setLoading(true);
    setVoteState('idle');
    try {
      const response = await fetch(`/v1/grader/exemplars/${exemplar.id}`);
      const payload = (await response.json()) as { data?: GraderExemplar };
      setDetail(payload.data ?? getGraderExemplar(exemplar.id)!);
    } finally {
      setLoading(false);
    }
  }

  async function vote(voteValue: 'up' | 'down') {
    try {
      const response = await fetch(`/v1/grader/exemplars/${detail.id}/feedback`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ vote: voteValue }),
      });
      setVoteState(response.ok ? 'sent' : 'error');
    } catch {
      setVoteState('error');
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="grid lg:grid-cols-[18rem_1fr]">
        <div className="border-b border-border bg-muted p-3 lg:border-b-0 lg:border-r">
          <p className="px-2 py-2 font-mono text-xs font-semibold uppercase text-secondary">
            Graded exemplars
          </p>
          <div className="grid gap-1">
            {exemplars.map((exemplar) => (
              <button
                key={exemplar.id}
                type="button"
                onClick={() => void selectExemplar(exemplar)}
                className={cn(
                  'rounded-md px-3 py-2 text-left text-sm transition-colors',
                  selected.id === exemplar.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-background/70 hover:text-foreground',
                )}
              >
                <span className="block font-semibold">{exemplar.title}</span>
                <span className="mt-0.5 block text-xs">
                  {exemplar.skill} / {exemplar.score}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <div className="border-b border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-semibold uppercase text-secondary">
                  Audit-ready grade
                </p>
                <h2 className={cn('mt-2 font-semibold', embedded ? 'text-2xl' : 'text-3xl')}>
                  {detail.title}
                </h2>
              </div>
              <div className="rounded-md border border-border bg-background px-4 py-3 text-center">
                <span className="block text-3xl font-semibold">{detail.score}</span>
                <span className="text-xs text-muted-foreground">score</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-80 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-secondary" />
            </div>
          ) : (
            <div className="grid gap-0 xl:grid-cols-[1fr_1fr]">
              <div className="border-b border-border p-4 xl:border-b-0 xl:border-r">
                <p className="font-mono text-xs font-semibold uppercase text-muted-foreground">
                  Question
                </p>
                <p className="mt-3 text-sm leading-6">{detail.question}</p>
                <p className="mt-5 font-mono text-xs font-semibold uppercase text-muted-foreground">
                  Candidate answer
                </p>
                <pre className="mt-3 max-h-80 overflow-auto rounded-md border border-border bg-background p-3 text-sm leading-6 whitespace-pre-wrap">
                  {detail.answer}
                </pre>
              </div>
              <div className="p-4">
                <p className="font-mono text-xs font-semibold uppercase text-muted-foreground">
                  Rubric
                </p>
                <div className="mt-3 grid gap-2">
                  {detail.rubric.map((criterion) => (
                    <div
                      key={criterion.criterion}
                      className="rounded-md border border-border bg-background p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold">{criterion.criterion}</span>
                        <span>{criterion.weight}%</span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{criterion.signal}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-2">
                  {detail.breakdown.map((row) => (
                    <div key={row.criterion} className="flex gap-3 text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary" />
                      <span>
                        <span className="font-semibold">{row.criterion}: </span>
                        {row.score} - <span className="text-muted-foreground">{row.note}</span>
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  className="mt-5 flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold"
                >
                  Reasoning trace
                  <ChevronDown
                    className={cn('size-4 transition-transform', expanded ? 'rotate-180' : '')}
                  />
                </button>
                {expanded ? (
                  <div className="mt-3 rounded-md border border-border bg-background p-3 text-sm leading-6 text-muted-foreground">
                    <ol className="space-y-2">
                      {detail.reasoning.map((step, index) => (
                        <li key={step}>
                          {index + 1}. {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                <div className="mt-4 rounded-md border border-border bg-muted p-3 font-mono text-xs text-muted-foreground">
                  {Object.entries(detail.auditMeta).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between gap-3 py-1">
                      <span>{key}</span>
                      <button
                        type="button"
                        onClick={() => void navigator.clipboard?.writeText(String(value))}
                        className="inline-flex max-w-[13rem] items-center gap-1 truncate text-foreground"
                      >
                        {String(value)}
                        <Copy className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Was this fair?</span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => void vote('up')}
                  >
                    <ThumbsUp className="size-4" />
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => void vote('down')}
                  >
                    <ThumbsDown className="size-4" />
                    No
                  </Button>
                  {voteState === 'sent' ? (
                    <span className="text-sm text-muted-foreground">Recorded.</span>
                  ) : null}
                  {voteState === 'error' ? (
                    <span className="text-sm text-danger">Could not record.</span>
                  ) : null}
                </div>
                {!embedded ? (
                  <Link
                    href="/demo"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-secondary"
                  >
                    See how this works on your assessments
                    <ChevronDown className="size-4 -rotate-90" />
                  </Link>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
