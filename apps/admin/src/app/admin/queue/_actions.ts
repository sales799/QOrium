'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { recordDecision } from '@/server/queue';
import { getAdminPool } from '@/server/db';
import { validateDecisionInput } from '@/server/decisions';

export interface DecisionActionState {
  status: 'idle' | 'success' | 'stale' | 'error';
  message?: string;
  questionId?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function recordDecisionAction(
  _prev: DecisionActionState,
  formData: FormData,
): Promise<DecisionActionState> {
  const session = await auth();
  const reviewerEmail = session?.user?.email;
  if (!reviewerEmail) {
    return { status: 'error', message: 'Unauthenticated.' };
  }

  const questionId = String(formData.get('questionId') ?? '').trim();
  if (!UUID_REGEX.test(questionId)) {
    return { status: 'error', message: 'Invalid question id.' };
  }

  const validation = validateDecisionInput({
    decision: formData.get('decision'),
    reviewerEmail,
    notes: formData.get('notes'),
  });
  if (!validation.ok) {
    return {
      status: 'error',
      message: validation.errors.map((e) => `${e.field}: ${e.message}`).join('; '),
      questionId,
    };
  }

  const result = await recordDecision(getAdminPool(), questionId, validation.value);
  if (result === null) {
    return {
      status: 'stale',
      message: 'Question is no longer in the SME review queue (someone else may have actioned it).',
      questionId,
    };
  }

  revalidatePath('/admin/queue');
  return {
    status: 'success',
    message: `Recorded ${result.decision}; status moved ${result.priorStatus} → ${result.nextStatus}.`,
    questionId,
  };
}
