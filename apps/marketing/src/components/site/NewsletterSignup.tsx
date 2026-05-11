'use client';

import { useActionState } from 'react';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { subscribeNewsletter, type NewsletterResult } from '@/actions/newsletter';

const initial: NewsletterResult = { ok: false, message: '' };

export function NewsletterSignup() {
  const [state, action, pending] = useActionState(subscribeNewsletter, initial);

  if (state.ok) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400">
        <CheckCircle2 className="size-4 shrink-0" />
        <span>{state.message}</span>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          placeholder="you@company.com"
          className="h-9 flex-1 rounded-md border border-border bg-background/50 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-secondary"
        />
        {/* Honeypot */}
        <input type="text" name="honeypot" className="hidden" tabIndex={-1} autoComplete="off" />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-secondary px-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/90 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <>
              Subscribe <ArrowRight className="size-3.5" />
            </>
          )}
        </button>
      </div>
      {state.message && !state.ok && <p className="text-xs text-red-400">{state.message}</p>}
    </form>
  );
}
