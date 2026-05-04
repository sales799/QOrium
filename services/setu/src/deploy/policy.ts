/**
 * Pure-logic deploy policy: given a GitHub push event, decide whether
 * we should deploy, and to which environment.
 *
 * Rules per `infra/runbooks/customer-zero-day-1.md`:
 *   - Push to `main`             → deploy production
 *   - Push to `staging`          → deploy staging
 *   - Push to `claude/*`         → deploy staging (autonomous build branch)
 *   - Anything else              → ignore
 *   - Force-pushes               → ignore (defence: never deploy a rewritten history)
 *   - Pushes that delete the ref → ignore
 *   - Pushes from forks          → ignore
 */

export type DeployEnv = 'production' | 'staging';

export interface PushEvent {
  ref: string;
  before: string;
  after: string;
  forced?: boolean;
  deleted?: boolean;
  repository?: { fork?: boolean; full_name?: string };
}

export interface DeployDecisionAccept {
  action: 'deploy';
  env: DeployEnv;
  branch: string;
  commit: string;
}

export interface DeployDecisionReject {
  action: 'ignore';
  reason: string;
}

export type DeployDecision = DeployDecisionAccept | DeployDecisionReject;

const ZERO_SHA = '0000000000000000000000000000000000000000';

export function decideDeploy(event: PushEvent): DeployDecision {
  if (event.deleted || event.after === ZERO_SHA) {
    return { action: 'ignore', reason: 'ref deletion ignored' };
  }
  if (event.forced) {
    return { action: 'ignore', reason: 'force-push ignored' };
  }
  if (event.repository?.fork) {
    return { action: 'ignore', reason: 'fork push ignored' };
  }
  if (!event.ref.startsWith('refs/heads/')) {
    return { action: 'ignore', reason: `non-branch ref: ${event.ref}` };
  }
  const branch = event.ref.slice('refs/heads/'.length);
  if (branch === 'main') {
    return { action: 'deploy', env: 'production', branch, commit: event.after };
  }
  if (branch === 'staging' || branch.startsWith('claude/')) {
    return { action: 'deploy', env: 'staging', branch, commit: event.after };
  }
  return { action: 'ignore', reason: `branch '${branch}' is not configured for auto-deploy` };
}
