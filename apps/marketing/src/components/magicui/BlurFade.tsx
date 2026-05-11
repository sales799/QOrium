'use client';

import * as React from 'react';
import { motion, useInView, useReducedMotion, type Variants } from 'motion/react';

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  variant?: { hidden: { y: number }; visible: { y: number } };
  duration?: number;
  delay?: number;
  yOffset?: number;
  inView?: boolean;
  inViewMargin?: string;
  blur?: string;
}

export function BlurFade({
  children,
  className,
  duration = 0.4,
  delay = 0,
  yOffset = 6,
  inView = false,
  inViewMargin = '-50px',
  blur = '6px',
}: BlurFadeProps) {
  const ref = React.useRef(null);
  const inViewResult = useInView(ref, {
    once: true,
    ...(inViewMargin ? { margin: inViewMargin as `${number}${'px' | '%'}` } : {}),
  });
  const reduce = useReducedMotion();
  const isInView = !inView || inViewResult;

  const variants: Variants = reduce
    ? {
        hidden: { opacity: 1, y: 0, filter: 'blur(0)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0)' },
      }
    : {
        hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
        visible: { y: -yOffset, opacity: 1, filter: 'blur(0px)' },
      };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      exit="hidden"
      variants={variants}
      transition={{ delay: 0.04 + delay, duration, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
