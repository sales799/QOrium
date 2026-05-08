'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

const SHIMMER_CLASSES =
  'group relative inline-flex h-11 cursor-pointer items-center justify-center overflow-hidden rounded-md px-6 text-sm font-medium text-ink transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

interface ShimmerStyleProps {
  shimmerColor?: string;
  background?: string;
}

interface ShimmerButtonAsButton
  extends ShimmerStyleProps,
    React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: undefined;
}

interface ShimmerButtonAsLink extends ShimmerStyleProps {
  href: string;
  className?: string;
  children?: React.ReactNode;
  'aria-label'?: string;
}

type ShimmerButtonProps = ShimmerButtonAsButton | ShimmerButtonAsLink;

function ShimmerInner({
  shimmerColor,
  children,
}: {
  shimmerColor: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
        style={{
          backgroundColor: 'transparent',
          backgroundImage: `linear-gradient(90deg, transparent, ${shimmerColor}40, transparent)`,
        }}
      />
      <span className="relative z-10">{children}</span>
    </>
  );
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ShimmerButtonProps
>((props, ref) => {
  const {
    children,
    className,
    shimmerColor = 'hsl(192 95% 50%)',
    background = 'hsl(192 95% 50%)',
  } = props;

  if ('href' in props && props.href) {
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={props.href}
        aria-label={props['aria-label']}
        className={cn(SHIMMER_CLASSES, className)}
        style={{ background }}
      >
        <ShimmerInner shimmerColor={shimmerColor}>{children}</ShimmerInner>
      </Link>
    );
  }

  const buttonProps = props as ShimmerButtonAsButton;
  const {
    shimmerColor: _s,
    background: _b,
    children: _c,
    className: _cn,
    ...nativeButtonProps
  } = buttonProps;
  void _s;
  void _b;
  void _c;
  void _cn;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={cn(SHIMMER_CLASSES, className)}
      style={{ background }}
      {...nativeButtonProps}
    >
      <ShimmerInner shimmerColor={shimmerColor}>{children}</ShimmerInner>
    </button>
  );
});
ShimmerButton.displayName = 'ShimmerButton';
