'use client';

import * as React from 'react';
import { CircleCheck, CircleAlert, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  initialLeadFormState,
  submitLeadCaptureForm,
  type LeadFormState,
} from '@/components/site/lead-form-submit';

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" variant="primary" disabled={pending} className="w-full">
      <Calendar className="size-4" />
      {pending ? 'Sending…' : 'Request a demo'}
    </Button>
  );
}

export function DemoForm() {
  const [state, setState] = React.useState<LeadFormState>(initialLeadFormState);
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }

    const form = event.currentTarget;
    setPending(true);
    setState(initialLeadFormState);

    try {
      const result = await submitLeadCaptureForm('demo', form);
      setState(result);
      if (result.ok) {
        form.reset();
      }
    } catch {
      setState({
        ok: false,
        message: 'Could not send the form right now. Please email us directly.',
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form action="/api/lead-capture" method="post" onSubmit={handleSubmit} className="grid gap-5">
      <input type="hidden" name="intent" value="demo" />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="sr-only"
        aria-hidden="true"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" required maxLength={120} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" required maxLength={120} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="role">Your role</Label>
          <Input id="role" name="role" maxLength={80} placeholder="Head of TA / CHRO / CTO" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="hiringVolume">Hiring volume / yr</Label>
          <select
            id="hiringVolume"
            name="hiringVolume"
            className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <option value="">Select…</option>
            <option value="<50">&lt; 50</option>
            <option value="50-500">50 – 500</option>
            <option value="500-5000">500 – 5,000</option>
            <option value="5000+">5,000+</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="primarySku">Most relevant SKU</Label>
          <select
            id="primarySku"
            name="primarySku"
            className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <option value="">Not sure yet</option>
            <option value="readybank">ReadyBank</option>
            <option value="jd-forge">JD-Forge</option>
            <option value="stack-vault">Stack-Vault</option>
            <option value="unsure">Unsure / all of the above</option>
          </select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="message">Anything else? (optional)</Label>
        <Textarea
          id="message"
          name="message"
          maxLength={4000}
          placeholder="Stack, current platform, leak concerns, JD volume per month."
          className="min-h-24"
        />
      </div>

      <SubmitButton pending={pending} />

      {state.message ? (
        <p
          className={`flex items-start gap-2 rounded-md border p-3 text-sm ${
            state.ok
              ? 'border-positive/40 bg-positive/5 text-positive'
              : 'border-warning/40 bg-warning/5 text-warning'
          }`}
          role={state.ok ? 'status' : 'alert'}
        >
          {state.ok ? (
            <CircleCheck className="mt-0.5 size-4 shrink-0" />
          ) : (
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
          )}
          <span>{state.message}</span>
        </p>
      ) : null}
    </form>
  );
}
