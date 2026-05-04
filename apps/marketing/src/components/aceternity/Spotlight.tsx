'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

interface SpotlightProps {
  className?: string;
  fill?: string;
}

export function Spotlight({ className, fill = 'hsl(192 95% 50%)' }: SpotlightProps) {
  return (
    <svg
      className={cn(
        'pointer-events-none absolute z-0 h-[170%] w-[170%] -translate-x-1/2 -translate-y-1/2 opacity-30 mix-blend-screen',
        className,
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      aria-hidden="true"
    >
      <defs>
        <filter
          id="filter"
          x="0"
          y="0"
          width="3787"
          height="2842"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="151" />
        </filter>
      </defs>
      <g filter="url(#filter)">
        <ellipse
          cx="1924"
          cy="273"
          rx="900"
          ry="450"
          transform="rotate(-45 1924 273)"
          fill={fill}
          fillOpacity="0.6"
        />
      </g>
    </svg>
  );
}
