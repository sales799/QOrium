import * as React from 'react';
import { cn } from '@/lib/cn';

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 md:grid-cols-2 md:auto-rows-[18rem] lg:grid-cols-3',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  className,
  title,
  description,
  header,
  icon,
  href,
  span = 1,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
  span?: 1 | 2;
}) {
  const Wrapper = href ? 'a' : 'div';
  const wrapperProps = href ? { href } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-lg border border-border bg-surface-1 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-signal-500/40',
        span === 2 && 'md:col-span-2',
        className,
      )}
    >
      {header ? <div className="relative h-32 overflow-hidden rounded-md">{header}</div> : null}
      <div className="mt-4 flex flex-col gap-2">
        {icon ? <div className="text-signal-500">{icon}</div> : null}
        {title ? <h3 className="text-lg font-semibold text-foreground">{title}</h3> : null}
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
    </Wrapper>
  );
}
