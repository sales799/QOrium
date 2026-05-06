'use client';

import { useActionState } from 'react';
import {
  deleteSubscriptionAction,
  toggleSubscriptionAction,
  type WebhookActionState,
} from '../_actions';
import type { WebhookSubscriptionDto } from '@/lib/clients/webhooks';

const INITIAL: WebhookActionState = { status: 'idle' };

interface RowProps {
  subscription: WebhookSubscriptionDto;
}

export function SubscriptionRow({ subscription }: RowProps) {
  const [toggleState, toggleAction, togglePending] = useActionState(
    toggleSubscriptionAction,
    INITIAL,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteSubscriptionAction,
    INITIAL,
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-neutral-200 bg-white p-4 text-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs">
            {subscription.eventType}
          </span>
          <code className="text-xs">{subscription.endpointUrl}</code>
        </div>
        <p className="text-xs text-neutral-500">
          {subscription.isActive ? (
            <span className="text-emerald-700">active</span>
          ) : (
            <span className="text-neutral-500">paused</span>
          )}{' '}
          · failures: {subscription.consecutiveFailures} · created{' '}
          {new Date(subscription.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <form action={toggleAction}>
          <input type="hidden" name="id" value={subscription.id} />
          <input type="hidden" name="is_active" value={subscription.isActive ? 'false' : 'true'} />
          <button
            type="submit"
            disabled={togglePending}
            className="rounded border border-neutral-300 bg-white px-3 py-1.5 text-xs hover:bg-neutral-100 disabled:opacity-50"
          >
            {togglePending ? '…' : subscription.isActive ? 'Pause' : 'Activate'}
          </button>
        </form>
        <form action={deleteAction}>
          <input type="hidden" name="id" value={subscription.id} />
          <button
            type="submit"
            disabled={deletePending}
            className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deletePending ? '…' : 'Delete'}
          </button>
        </form>
      </div>
      {(toggleState.message || deleteState.message) && (
        <p role="status" className="basis-full text-xs text-neutral-600">
          {toggleState.message ?? deleteState.message}
        </p>
      )}
    </div>
  );
}
