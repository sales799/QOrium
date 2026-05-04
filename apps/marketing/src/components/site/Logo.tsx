import * as React from 'react';
import { cn } from '@/lib/cn';

// PLACEHOLDER LOGO — designed Sprint 3 of the autonomous build. The mark is a
// stylized "Q" rendered as an open data-loop, gesturing at the role-graph
// architecture. Replace with a finalized brand asset post-launch without
// touching surrounding components.
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
        className="size-7"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="qorium-mark"
            x1="0"
            y1="0"
            x2="32"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="hsl(192 95% 50%)" />
            <stop offset="1" stopColor="hsl(195 100% 70%)" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="13" stroke="url(#qorium-mark)" strokeWidth="2.5" fill="none" />
        <path
          d="M22 22 L29 29"
          stroke="url(#qorium-mark)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="16" cy="16" r="2" fill="url(#qorium-mark)" />
      </svg>
      {variant === 'wordmark' ? (
        <span className="font-sans text-lg font-semibold tracking-tight">Qorium</span>
      ) : null}
    </span>
  );
}
