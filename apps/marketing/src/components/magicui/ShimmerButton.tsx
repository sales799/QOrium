'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  background?: string;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      children,
      className,
      shimmerColor = 'hsl(192 95% 50%)',
      background = 'hsl(192 95% 50%)',
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'group relative inline-flex h-11 cursor-pointer items-center justify-center overflow-hidden rounded-md px-6 text-sm font-medium text-ink transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          className,
        )}
        style={{ background }}
        {...props}
      >
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
          style={{
            backgroundColor: 'transparent',
            backgroundImage: `linear-gradient(90deg, transparent, ${shimmerColor}40, transparent)`,
          }}
        />
        <span className="relative z-10">{children}</span>
      </button>
    );
  },
);
ShimmerButton.displayName = 'ShimmerButton';
