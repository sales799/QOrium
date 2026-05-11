import * as React from 'react';
import { cn } from '@/lib/cn';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow ? (
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-300">{eyebrow}</p>
      ) : null}
      <h2 className="text-balance font-sans text-display-2 font-semibold text-foreground">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg',
            align === 'center' && 'mx-auto',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
