'use client';

import * as React from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'main';
}

export function FadeIn({ children, delay = 0, className, as = 'div' }: FadeInProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;

  const variants: Variants = reduce
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 1, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, delay, ease: [0.25, 1, 0.5, 1] },
        },
      };

  return (
    <Tag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-15%' }}
      variants={variants}
      className={className}
    >
      {children}
    </Tag>
  );
}
