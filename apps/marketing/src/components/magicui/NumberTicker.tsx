'use client';

import * as React from 'react';
import { useInView, useMotionValue, useSpring, useReducedMotion } from 'motion/react';

import { cn } from '@/lib/cn';

interface NumberTickerProps {
  value: number;
  direction?: 'up' | 'down';
  className?: string;
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
}

export function NumberTicker({
  value,
  direction = 'up',
  className,
  decimalPlaces = 0,
  prefix = '',
  suffix = '',
}: NumberTickerProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const isInView = useInView(ref, { once: true, margin: '0px' });
  const motionValue = useMotionValue(direction === 'down' ? value : 0);
  const springValue = useSpring(motionValue, { damping: 60, stiffness: 100 });

  React.useEffect(() => {
    if (isInView) motionValue.set(direction === 'down' ? 0 : value);
  }, [motionValue, isInView, direction, value]);

  React.useEffect(() => {
    if (reduce) {
      if (ref.current) {
        ref.current.textContent = `${prefix}${value.toLocaleString('en-IN', {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        })}${suffix}`;
      }
      return;
    }
    return springValue.on('change', (latest: number) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Number(latest.toFixed(decimalPlaces)).toLocaleString(
          'en-IN',
          {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          },
        )}${suffix}`;
      }
    });
  }, [springValue, decimalPlaces, prefix, suffix, reduce, value]);

  return (
    <span
      ref={ref}
      className={cn('inline-block font-mono tabular-nums tracking-tight', className)}
      aria-label={`${prefix}${value}${suffix}`}
    >
      {prefix}0{suffix}
    </span>
  );
}
