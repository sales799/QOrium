import * as React from 'react';
import { cn } from '@/lib/cn';

// PLACEHOLDER LOGO — geometric Q + connector mark inspired by the role-graph.
// Uses currentColor so it adapts to light/dark theme automatically. Final
// brand asset replaces this without API changes.
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
        <circle cx="13" cy="13" r="11" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M19.5 19.5 L25 25" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="13" cy="13" r="2.2" fill="var(--secondary)" />
      </svg>
      {variant === 'wordmark' ? (
        <span className="font-sans text-lg font-semibold tracking-tight">Qorium</span>
      ) : null}
    </span>
  );
}
