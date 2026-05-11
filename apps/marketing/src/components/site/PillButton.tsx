import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';

interface PillButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

const styles: Record<Variant, string> = {
  primary:
    'bg-foreground text-background shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_3px_3px_-1.5px_rgba(16,24,40,0.06),0_1px_1px_rgba(16,24,40,0.08)] border border-white/[0.12] hover:bg-foreground/85 transition-all ease-out active:scale-95',
  secondary:
    'bg-background text-foreground border border-border hover:bg-secondary/40 transition-all ease-out active:scale-95',
  ghost: 'text-foreground hover:bg-secondary/40 transition-colors',
};

export function PillButton({ href, children, variant = 'primary', className }: PillButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-medium tracking-wide',
        styles[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
