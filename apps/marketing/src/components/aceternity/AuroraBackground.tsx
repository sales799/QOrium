import * as React from 'react';
import { cn } from '@/lib/cn';

interface AuroraBackgroundProps {
  className?: string;
  showRadialGradient?: boolean;
}

export function AuroraBackground({ className, showRadialGradient = true }: AuroraBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      <div
        className={cn(
          'absolute inset-0 opacity-60',
          'bg-[radial-gradient(circle_at_20%_20%,hsl(192_95%_50%/0.25)_0%,transparent_45%),radial-gradient(circle_at_80%_80%,hsl(195_100%_70%/0.18)_0%,transparent_50%)]',
          'animate-aurora',
          showRadialGradient &&
            '[mask-image:radial-gradient(ellipse_at_50%_30%,black_30%,transparent_75%)]',
        )}
      />
    </div>
  );
}
