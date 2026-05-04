'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

interface BackgroundBeamsProps {
  className?: string;
}

const PATHS = [
  'M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875',
  'M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867',
  'M-366 -205C-366 -205 -298 200 166 327C630 454 698 859 698 859',
  'M-359 -213C-359 -213 -291 192 173 319C637 446 705 851 705 851',
  'M-352 -221C-352 -221 -284 184 180 311C644 438 712 843 712 843',
  'M-345 -229C-345 -229 -277 176 187 303C651 430 719 835 719 835',
  'M-338 -237C-338 -237 -270 168 194 295C658 422 726 827 726 827',
  'M-331 -245C-331 -245 -263 160 201 287C665 414 733 819 733 819',
  'M-324 -253C-324 -253 -256 152 208 279C672 406 740 811 740 811',
];

export function BackgroundBeams({ className }: BackgroundBeamsProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]',
        className,
      )}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 696 700"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="beam-gradient" x1="0" y1="0" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(192 95% 50%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(192 95% 50%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(195 100% 70%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {PATHS.map((d, i) => (
          <path
            key={i}
            d={d}
            stroke="url(#beam-gradient)"
            strokeOpacity={0.3 + (i % 3) * 0.15}
            strokeWidth={i % 2 === 0 ? 1 : 0.6}
            fill="none"
          />
        ))}
      </svg>
    </div>
  );
}
