import * as React from 'react';
import { cn } from '@/lib/cn';

// PLACEHOLDER LOGO — composite mark inspired by the role-graph + library
// taxonomy: a circular boundary (the bank), a node-and-edge motif (the
// graph), and a centered accent (the calibrated answer). currentColor
// drives the wordmark + outer ring so theme switching is automatic; the
// secondary token drives the accent so brand color owns the focal point.
// Final brand asset replaces this without API changes.
interface LogoProps {
  className?: string;
  variant?: 'wordmark' | 'mark';
}

export function Logo({ className, variant = 'wordmark' }: LogoProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-2 text-foreground', className)}
      aria-label="Qorium"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="size-7"
      >
        {/* outer ring — the bank */}
        <circle cx="13" cy="13" r="11" stroke="currentColor" strokeWidth="1.6" fill="none" />
        {/* role-graph nodes around the perimeter */}
        <circle cx="13" cy="3" r="1.4" fill="currentColor" />
        <circle cx="22.07" cy="8.5" r="1.4" fill="currentColor" />
        <circle cx="22.07" cy="17.5" r="1.4" fill="currentColor" />
        <circle cx="3.93" cy="8.5" r="1.4" fill="currentColor" />
        {/* edges from perimeter to center node */}
        <path
          d="M13 3 L13 13 M22.07 8.5 L13 13 M22.07 17.5 L13 13 M3.93 8.5 L13 13"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity="0.45"
        />
        {/* center node — the calibrated answer */}
        <circle cx="13" cy="13" r="2.6" fill="var(--secondary)" />
        {/* Q descender — the library tail */}
        <path d="M19.5 19.5 L25 25" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      {variant === 'wordmark' ? (
        <span className="font-sans text-lg font-semibold tracking-tight">Qorium</span>
      ) : null}
    </span>
  );
}
