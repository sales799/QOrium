'use client';

import * as React from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  delayChildren?: number;
  staggerChildren?: number;
}

export function Stagger({
  children,
  className,
  delayChildren = 0,
  staggerChildren = 0.08,
}: StaggerProps) {
  const reduce = useReducedMotion();
  const variants: Variants = reduce
    ? {}
    : {
        hidden: {},
        visible: {
          transition: { delayChildren, staggerChildren },
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

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const variants: Variants = reduce
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 1, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
      };

  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}
