'use client';

import * as React from 'react';
import { motion, useInView } from 'motion/react';
import { Database } from 'lucide-react';

const LINES = [
  '{',
  '  "pack_id": "rb_pkg_01HXY7Z3K9V",',
  '  "role": "Senior Backend Engineer",',
  '  "questions": [',
  '    { "uuid": "rb_q_01HXY8M2P5R",',
  '      "format": "Coding-fn",',
  '      "skill": "java.spring.transactional",',
  '      "difficulty_band": 4,',
  '      "irt_calibrated": "2026-04-22",',
  '      "anti_leak_scan": "clean" },',
  '    { "uuid": "rb_q_01HXY8M9Q1Z",',
  '      "format": "SJT",',
  '      "skill": "java.system.idempotency",',
  '      "difficulty_band": 4 },',
  '    { "uuid": "rb_q_01HXY8N4D8X",',
  '      "format": "MCQ",',
  '      "skill": "java.spring.security",',
  '      "difficulty_band": 3 }',
  '  ],',
  '  "watermark": { "customer_id": "talpro" }',
  '}',
];

export function ReadyBankBento() {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);
  const [printed, setPrinted] = React.useState(0);

  React.useEffect(() => {
    if (!isInView) {
      setPrinted(0);
      return;
    }
    const id = setInterval(() => {
      setPrinted((p) => (p < LINES.length ? p + 1 : p));
    }, 110);
    return () => clearInterval(id);
  }, [isInView]);

  return (
    <div
      ref={ref}
      className="relative flex h-full w-full items-end justify-center overflow-hidden p-4"
    >
      <div className="pointer-events-none absolute bottom-0 left-0 z-20 h-20 w-full bg-gradient-to-t from-background to-transparent" />
      <div className="relative w-full max-w-[28rem] rounded-lg border border-border bg-card shadow-md">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Database className="size-3.5 text-signal-500" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            POST /v1/packs/generate
          </span>
          <span className="ml-auto rounded-full bg-positive/10 px-2 py-0.5 font-mono text-[10px] text-positive">
            200
          </span>
        </div>
        <pre className="m-0 overflow-hidden p-3 font-mono text-[10px] leading-relaxed text-foreground/85">
          {LINES.slice(0, printed).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18 }}
            >
              {line || ' '}
            </motion.div>
          ))}
          {printed > 0 && printed < LINES.length && (
            <span className="inline-block h-3 w-2 animate-blink-cursor bg-signal-500 align-middle" />
          )}
        </pre>
      </div>
    </div>
  );
}
