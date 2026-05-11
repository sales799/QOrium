'use client';

import * as React from 'react';
import { motion, useInView } from 'motion/react';
import { Sparkles } from 'lucide-react';

const STEPS = [
  { label: 'JD parsed', detail: 'Senior Salesforce Dev · Apex · LWC · Health Cloud', delay: 0.2 },
  {
    label: 'Format mix planned',
    detail: '5 MCQ · 3 LWC · 2 SJT · 5 Coding · 3 SD · 2 Take-home',
    delay: 0.6,
  },
  { label: 'AI drafted 20 questions', detail: '11.2s elapsed · all dimensions ≥7', delay: 1.4 },
  {
    label: 'Self-critique passed',
    detail: 'Ambiguity 9 · distractors 8 · bias 9 · leak risk 9',
    delay: 2.4,
  },
  { label: 'Pack ready', detail: '20.4s total · JSON + HackerRank YAML available', delay: 3.4 },
];

export function JdForgeBento() {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    if (!isInView) {
      setTick(0);
      return;
    }
    const id = setInterval(() => setTick((t) => t + 0.1), 100);
    return () => clearInterval(id);
  }, [isInView]);

  return (
    <div
      ref={ref}
      className="relative flex h-full w-full items-center justify-center overflow-hidden p-4"
    >
      <div className="pointer-events-none absolute bottom-0 left-0 z-20 h-20 w-full bg-gradient-to-t from-background to-transparent" />
      <div className="relative w-full max-w-[28rem] space-y-2 rounded-lg border border-border bg-card p-3 shadow-md">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Sparkles className="size-3.5 text-signal-500" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            JD-Forge · standard tier
          </span>
          <span className="ml-auto font-mono text-[10px] text-foreground">
            {Math.min(tick, 30).toFixed(1)}s
          </span>
        </div>

        <div className="rounded border border-border bg-background/40 p-2 font-mono text-[10px] text-muted-foreground">
          <span className="text-foreground">Title:</span> Senior Salesforce Developer (5+ yrs)
        </div>

        {STEPS.map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 6 }}
            animate={tick >= s.delay ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 0.25 }}
            className="flex items-start gap-2 text-[11px]"
          >
            <div
              className={`mt-1 size-1.5 shrink-0 rounded-full ${
                tick >= s.delay ? 'bg-positive' : 'bg-border'
              }`}
            />
            <div className="flex-1">
              <p className="font-medium text-foreground">{s.label}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{s.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
