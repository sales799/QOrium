'use client';

import { useActionState } from 'react';
import { recordDecisionAction, type DecisionActionState } from '@/app/admin/queue/_actions';

const INITIAL_STATE: DecisionActionState = { status: 'idle' };

interface DecisionFormProps {
  questionId: string;
}

export function DecisionForm({ questionId }: DecisionFormProps) {
  const [state, formAction, pending] = useActionState(recordDecisionAction, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="questionId" value={questionId} />

      <label className="block space-y-1">
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
          Notes (required for &quot;send back for edits&quot;)
        </span>
        <textarea
          name="notes"
          rows={2}
          maxLength={2000}
          className="block w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="What needs to change? Will be visible to the author."
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          name="decision"
          value="accept"
          disabled={pending}
          className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          Accept → calibrating
        </button>
        <button
          type="submit"
          name="decision"
          value="edit"
          disabled={pending}
          className="rounded bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-50"
        >
          Send back for edits
        </button>
        <button
          type="submit"
          name="decision"
          value="reject"
          disabled={pending}
          className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          Reject → deprecated
        </button>
      </div>

      {state.status !== 'idle' && state.questionId === questionId && state.message && (
        <p
          role="status"
          className={
            state.status === 'success'
              ? 'text-xs text-emerald-700 dark:text-emerald-400'
              : state.status === 'stale'
                ? 'text-xs text-amber-700 dark:text-amber-400'
                : 'text-xs text-red-700 dark:text-red-400'
          }
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
