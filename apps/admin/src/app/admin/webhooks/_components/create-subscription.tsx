'use client';

import { useActionState } from 'react';
import { createSubscriptionAction, type WebhookActionState } from '../_actions';

const INITIAL: WebhookActionState = { status: 'idle' };

const EVENT_TYPES = [
  '*',
  'question.released',
  'question.updated',
  'question.deprecated',
  'jd_forge.order.created',
  'jd_forge.order.questions_generated',
  'jd_forge.order.exported',
  'jd_forge.order.feedback_received',
  'stack_vault.question.submitted',
  'stack_vault.question.review_started',
  'stack_vault.question.approved',
  'stack_vault.question.released',
  'stack_vault.question.rejected',
  'leak.detected',
  'leak.confirmed',
  'audit.export_requested',
];

export function CreateSubscriptionForm() {
  const [state, formAction, pending] = useActionState(createSubscriptionAction, INITIAL);

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
    >
      <h2 className="text-base font-semibold">Add subscription</h2>
      <div className="grid grid-cols-3 gap-3">
        <label className="col-span-1 block space-y-1">
          <span className="text-xs font-medium">Event type</span>
          <select
            name="event_type"
            defaultValue="*"
            className="block w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="col-span-2 block space-y-1">
          <span className="text-xs font-medium">Endpoint URL (HTTPS only)</span>
          <input
            name="endpoint_url"
            type="url"
            placeholder="https://acme.example.com/qorium-hook"
            required
            className="block w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending ? 'Creating…' : 'Add subscription'}
        </button>
        {state.status === 'error' && state.message && (
          <p role="status" className="text-xs text-red-700">
            {state.message}
          </p>
        )}
      </div>
      {state.status === 'success' && state.signingSecret && (
        <div className="rounded border border-emerald-300 bg-emerald-50 p-3 text-xs">
          <p className="font-semibold">Signing secret (shown once)</p>
          <pre className="mt-2 overflow-x-auto rounded bg-white p-2 font-mono text-[11px]">
            {state.signingSecret}
          </pre>
          <p className="mt-2 text-[11px] text-emerald-900">
            Copy this now and store it in your secret manager. QOrium will not display it again.
          </p>
        </div>
      )}
    </form>
  );
}
