/**
 * SME decision workflow — pure logic. Status transitions are encoded here so
 * they can be unit-tested without bringing in Postgres or NextAuth.
 *
 * See `infra/B7-postgres-migrations/0003_review_decisions.sql` and CTO
 * Architecture §6.3 for the canonical workflow.
 */

export type ReviewableStatus = 'sme_review';
export type ReviewDecision = 'accept' | 'edit' | 'reject';
export type NextStatus = 'calibrating' | 'draft' | 'deprecated';

const TRANSITIONS: Readonly<Record<ReviewDecision, NextStatus>> = Object.freeze({
  accept: 'calibrating',
  edit: 'draft',
  reject: 'deprecated',
});

export function nextStatusFor(decision: ReviewDecision): NextStatus {
  return TRANSITIONS[decision];
}

export function isReviewableStatus(value: string): value is ReviewableStatus {
  return value === 'sme_review';
}

export function isReviewDecision(value: unknown): value is ReviewDecision {
  return value === 'accept' || value === 'edit' || value === 'reject';
}

export interface DecisionInput {
  decision: ReviewDecision;
  reviewerEmail: string;
  notes?: string | undefined;
}

export interface DecisionValidationError {
  field: 'decision' | 'reviewerEmail' | 'notes';
  message: string;
}

export function validateDecisionInput(raw: {
  decision: unknown;
  reviewerEmail: unknown;
  notes: unknown;
}): { ok: true; value: DecisionInput } | { ok: false; errors: DecisionValidationError[] } {
  const errors: DecisionValidationError[] = [];

  if (!isReviewDecision(raw.decision)) {
    errors.push({ field: 'decision', message: 'must be accept|edit|reject' });
  }
  if (typeof raw.reviewerEmail !== 'string' || raw.reviewerEmail.trim().length === 0) {
    errors.push({ field: 'reviewerEmail', message: 'required' });
  }

  let notes: string | undefined;
  if (raw.notes != null) {
    if (typeof raw.notes !== 'string') {
      errors.push({ field: 'notes', message: 'must be a string' });
    } else {
      const trimmed = raw.notes.trim();
      if (trimmed.length > 2000) {
        errors.push({ field: 'notes', message: 'max 2000 chars' });
      } else if (trimmed.length > 0) {
        notes = trimmed;
      }
    }
  }

  // The 'edit' decision MUST carry notes — that's how the SME tells the
  // author what to change. Other decisions may include notes optionally.
  if (raw.decision === 'edit' && (notes === undefined || notes.length === 0)) {
    errors.push({
      field: 'notes',
      message: 'notes are required when sending the question back for edits',
    });
  }

  if (errors.length > 0) return { ok: false, errors };

  const value: DecisionInput = {
    decision: raw.decision as ReviewDecision,
    reviewerEmail: (raw.reviewerEmail as string).trim().toLowerCase(),
  };
  if (notes !== undefined) value.notes = notes;
  return { ok: true, value };
}
