import { clsx, type ClassValue } from 'clsx';
import * as Color from 'color-bits';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Convert any CSS color string to rgba — used by FlickeringGrid for canvas perf.
export function getRGBA(
  cssColor: React.CSSProperties['color'] | undefined,
  fallback: string = 'rgba(180, 180, 180, 1)',
): string {
  if (typeof window === 'undefined') return fallback;
  if (!cssColor) return fallback;
  try {
    if (typeof cssColor === 'string' && cssColor.startsWith('var(')) {
      const el = document.createElement('div');
      el.style.color = cssColor;
      document.body.appendChild(el);
      const computed = window.getComputedStyle(el).color;
      document.body.removeChild(el);
      return Color.formatRGBA(Color.parse(computed));
    }
    return Color.formatRGBA(Color.parse(cssColor));
  } catch {
    return fallback;
  }
}

export function colorWithOpacity(color: string, opacity: number): string {
  if (!color.startsWith('rgb')) return color;
  return Color.formatRGBA(Color.alpha(Color.parse(color), opacity));
}
