'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

const KEY = 'qorium-cookie-consent';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) {
      const t = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const close = (v: string) => {
    localStorage.setItem(KEY, v);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-50 rounded-lg border border-border bg-background/95 p-3 shadow-lg backdrop-blur-sm sm:left-1/2 sm:right-auto sm:w-[min(calc(100vw-2rem),44rem)] sm:-translate-x-1/2 sm:p-4"
    >
      <button
        onClick={() => close('declined')}
        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:text-foreground"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex flex-col gap-3 pr-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use privacy-friendly analytics (Plausible). No personal data is collected.{' '}
          <Link href="/cookie-policy" className="underline hover:text-foreground">
            Cookie Policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => close('accepted')}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Accept
          </button>
          <button
            onClick={() => close('declined')}
            className="rounded-md border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
