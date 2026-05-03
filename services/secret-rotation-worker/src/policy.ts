/**
 * Pure-logic rotation policy evaluator per
 * `infra/B6-Secret-Rotation-Calendar.md` §2.
 *
 * Given the current row + clock, decide whether a reminder needs
 * to fire, whether the secret is overdue, or whether the row is
 * still healthy. Caller persists the new state.
 */

export type SecretStatus = 'scheduled' | 'reminder_sent' | 'overdue' | 'rotated' | 'paused';

export interface PolicyInputs {
  status: SecretStatus;
  nextRotationDue: Date;
  /** Override `now` for tests. */
  now?: () => Date;
  /** How many days before due to send the first reminder. Default 7. */
  reminderLeadDays?: number;
  /** How many days after due before marking overdue. Default 0 (immediate). */
  overdueGraceDays?: number;
}

export type PolicyDecision =
  | { action: 'no_op'; reason: string }
  | { action: 'send_reminder'; daysUntilDue: number }
  | { action: 'mark_overdue'; daysOverdue: number };

export function evaluatePolicy(inputs: PolicyInputs): PolicyDecision {
  if (inputs.status === 'paused') {
    return { action: 'no_op', reason: 'rotation is paused' };
  }
  const now = (inputs.now ?? (() => new Date()))();
  const reminderLead = inputs.reminderLeadDays ?? 7;
  const overdueGrace = inputs.overdueGraceDays ?? 0;
  const msUntilDue = inputs.nextRotationDue.getTime() - now.getTime();
  const daysUntilDue = Math.floor(msUntilDue / 86_400_000);

  if (daysUntilDue < -overdueGrace) {
    if (inputs.status === 'overdue') {
      return { action: 'no_op', reason: 'already marked overdue' };
    }
    return { action: 'mark_overdue', daysOverdue: -daysUntilDue };
  }
  if (daysUntilDue <= reminderLead && inputs.status !== 'reminder_sent') {
    return { action: 'send_reminder', daysUntilDue };
  }
  return { action: 'no_op', reason: 'within healthy window' };
}

/** Days between rotations per B6 §2. Used to schedule the next due date after a successful rotation. */
export const DEFAULT_POLICY_DAYS: Record<string, number> = {
  database_url: 90,
  api_key: 180,
  webhook_secret: 180,
  oauth_client: 365,
  jwt_signing_key: 365,
  tls_certificate: 60,
  ssh_key: 180,
  storage_credentials: 90,
  webhook_subscription_secret: 180,
  sso_oidc_secret: 180,
  integration_token: 180,
};

export function nextDueDate(
  resourceType: string,
  now: Date = new Date(),
  policyDays?: number,
): Date {
  const days = policyDays ?? DEFAULT_POLICY_DAYS[resourceType] ?? 180;
  return new Date(now.getTime() + days * 86_400_000);
}
