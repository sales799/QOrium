'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

interface AnimatedBeamProps {
  className?: string;
  duration?: number;
  delay?: number;
  pathColor?: string;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
}

export function AnimatedBeamHorizontal({
  className,
  duration = 4,
  delay = 0,
  pathColor = 'hsl(222 25% 20%)',
  pathOpacity = 0.6,
  gradientStartColor = 'hsl(192 95% 50%)',
  gradientStopColor = 'hsl(195 100% 70%)',
}: AnimatedBeamProps) {
  const id = React.useId();
  return (
    <svg
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`beam-${id}`} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="50%" stopColor={gradientStartColor} stopOpacity="1" />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <line
        x1="0"
        y1="50%"
        x2="100%"
        y2="50%"
        stroke={pathColor}
        strokeOpacity={pathOpacity}
        strokeWidth="2"
        strokeDasharray="6 6"
      />
      <line
        x1="0"
        y1="50%"
        x2="100%"
        y2="50%"
        stroke={`url(#beam-${id})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="120"
        style={{
          animation: `beam-flow ${duration}s linear ${delay}s infinite`,
        }}
      />
      <style>{`@keyframes beam-flow { from { stroke-dashoffset: 240; } to { stroke-dashoffset: 0; } }`}</style>
    </svg>
  );
}
