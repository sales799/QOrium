'use client';

import * as React from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react';

interface MagneticButtonProps {
  children: React.ReactNode;
  intensity?: number;
  className?: string;
}

export function MagneticButton({ children, intensity = 0.25, className }: MagneticButtonProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 250, damping: 18 });
  const springY = useSpring(y, { stiffness: 250, damping: 18 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current || reduce) return;
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    x.set((e.clientX - cx) * intensity);
    y.set((e.clientY - cy) * intensity);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={reduce ? { x: 0, y: 0 } : { x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
