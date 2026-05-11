import * as React from 'react';
import { cn } from '@/lib/cn';

interface MaxWidthProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'section' | 'main' | 'article' | 'header' | 'footer';
}

export function MaxWidth({ as: Tag = 'div', className, children, ...props }: MaxWidthProps) {
  return (
    <Tag className={cn('mx-auto w-full max-w-content px-6', className)} {...props}>
      {children}
    </Tag>
  );
}
