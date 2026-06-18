'use client';

import * as React from 'react';
import { CircleCheck, CircleAlert, Send } from 'lucide-react';

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
      <Send className="size-4" />
      {pending ? 'Sending…' : 'Send message'}
    </Button>
  );
}

export function ContactForm() {
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
      const result = await submitLeadCaptureForm('contact', form);
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
      <input type="hidden" name="intent" value="contact" />
      {/* Honeypot — hidden from users, picked up by bots */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="sr-only"
        aria-hidden="true"
      />

      <div className="grid gap-2">
        <Label htmlFor="name">Your name</Label>
        <Input id="name" name="name" required maxLength={120} placeholder="Jane Engineer" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="jane@company.com"
          autoComplete="email"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" maxLength={120} placeholder="Acme Co" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="role">Your role</Label>
          <Input id="role" name="role" maxLength={80} placeholder="Head of TA" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="message">What are you trying to solve?</Label>
        <Textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={4000}
          placeholder="Hiring volume, stack, leak concerns, current platform — whatever's relevant."
          className="min-h-32"
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
