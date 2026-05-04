'use client';

import * as React from 'react';
import { motion, useInView } from 'motion/react';
import { Lock, Fingerprint } from 'lucide-react';

const NODES = [
  { x: 50, y: 12, id: 'C' },
  { x: 12, y: 50, id: '1' },
  { x: 88, y: 50, id: '2' },
  { x: 50, y: 88, id: '3' },
];

export function StackVaultBento() {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);

  return (
    <div
      ref={ref}
      className="relative flex h-full w-full items-center justify-center overflow-hidden p-6"
    >
      <div className="pointer-events-none absolute bottom-0 left-0 z-20 h-20 w-full bg-gradient-to-t from-background to-transparent" />

      <div className="relative size-56">
        {/* Central watermark seal */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
          transition={{ duration: 0.7, type: 'spring', damping: 12 }}
          className="absolute left-1/2 top-1/2 z-10 flex size-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-card shadow-lg ring-1 ring-border"
        >
          <Fingerprint className="size-7 text-signal-500" />
          <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-muted-foreground">
            Watermark
          </span>
        </motion.div>

        {/* Connecting lines + outer nodes */}
        <svg className="absolute inset-0" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="sv-line" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="hsl(192 95% 50%)" stopOpacity="0.6" />
              <stop offset="1" stopColor="hsl(192 95% 50%)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {NODES.map((n, i) => (
            <motion.line
              key={i}
              x1={n.x}
              y1={n.y}
              x2={50}
              y2={50}
              stroke="url(#sv-line)"
              strokeWidth="0.6"
              strokeDasharray="2 1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
            />
          ))}
        </svg>

        {NODES.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <div className="flex size-10 items-center justify-center rounded-full border border-border bg-card font-mono text-[10px] text-foreground shadow">
              {n.id}
            </div>
          </motion.div>
        ))}

        {/* Lock badge in corner */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
          transition={{ duration: 0.3, delay: 1.0 }}
          className="absolute -right-2 -top-2 z-20 flex items-center gap-1 rounded-full bg-positive/10 px-2 py-1 text-[10px] text-positive ring-1 ring-positive/30"
        >
          <Lock className="size-3" />
          <span className="font-medium">Exclusive</span>
        </motion.div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Per-customer cryptographic mark
        </p>
      </div>
    </div>
  );
}
