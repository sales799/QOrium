'use client';

import * as React from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';

type Direction = 'up' | 'down' | 'left' | 'right';

interface RevealProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  distance?: number;
  className?: string;
}

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 24 },
  down: { x: 0, y: -24 },
  left: { x: 24, y: 0 },
  right: { x: -24, y: 0 },
};

export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  distance,
  className,
}: RevealProps) {
  const reduce = useReducedMotion();
  const offset = offsets[direction];
  const x = distance ? Math.sign(offset.x) * distance : offset.x;
  const y = distance ? Math.sign(offset.y) * distance : offset.y;

  const variants: Variants = reduce
    ? { hidden: { opacity: 1, x: 0, y: 0 }, visible: { opacity: 1, x: 0, y: 0 } }
    : {
        hidden: { opacity: 1, x, y },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: { duration: 0.5, delay, ease: [0.25, 1, 0.5, 1] },
        },
      };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10%' }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
