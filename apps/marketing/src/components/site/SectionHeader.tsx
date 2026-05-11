import * as React from 'react';
import { cn } from '@/lib/cn';

interface SectionHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionHeader({ children, className }: SectionHeaderProps) {
  return (
    <div className={cn('w-full border-b p-10 md:p-14', className)}>
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-2">
        {children}
      </div>
    </div>
  );
}
