'use client';

import * as React from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { ShieldAlert, RotateCw, CheckCircle2 } from 'lucide-react';

const PHASES = [
  { id: 0, label: 'Scanning', accent: 'text-muted-foreground' },
  { id: 1, label: 'Match detected on Reddit', accent: 'text-warning' },
  { id: 2, label: 'AI variant generated', accent: 'text-signal-500' },
  { id: 3, label: 'SME approved · v2 released', accent: 'text-positive' },
];

export function AntiLeakBento() {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);
  const [phase, setPhase] = React.useState(0);

  React.useEffect(() => {
    if (!isInView) {
      setPhase(0);
      return;
    }
    const id = setInterval(() => {
      setPhase((p) => (p + 1) % 4);
    }, 1600);
    return () => clearInterval(id);
  }, [isInView]);

  return (
    <div
      ref={ref}
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-6"
    >
      <div className="pointer-events-none absolute bottom-0 left-0 z-20 h-20 w-full bg-gradient-to-t from-background to-transparent" />

      <div className="relative size-40">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-signal-500/20"
            animate={{
              scale: [1, 1.6 + i * 0.3],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.5,
              repeat: Infinity,
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {phase < 2 ? (
              <motion.div
                key="scan"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex size-20 items-center justify-center rounded-full bg-card shadow-md"
              >
                <ShieldAlert
                  className={`size-9 ${phase === 1 ? 'text-warning' : 'text-muted-foreground'}`}
                />
              </motion.div>
            ) : phase === 2 ? (
              <motion.div
                key="rotate"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                className="flex size-20 items-center justify-center rounded-full bg-card shadow-md"
              >
                <RotateCw className="size-9 animate-spin text-signal-500" />
              </motion.div>
            ) : (
              <motion.div
                key="ok"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className="flex size-20 items-center justify-center rounded-full bg-card shadow-md"
              >
                <CheckCircle2 className="size-10 text-positive" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="z-10 mt-6 w-full max-w-xs text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className={`font-mono text-xs uppercase tracking-[0.18em] ${PHASES[phase]?.accent ?? ''}`}
          >
            {PHASES[phase]?.label}
          </motion.p>
        </AnimatePresence>
        <div className="mt-3 flex justify-center gap-1.5">
          {PHASES.map((p) => (
            <div
              key={p.id}
              className={`h-1 w-6 rounded-full transition-colors ${
                p.id <= phase ? 'bg-signal-500' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
