import { describe, expect, it } from 'vitest';
import { decideDeploy } from '../src/deploy/policy';
import { signGitHubBody, verifyGitHubSignature } from '../src/deploy/signature';
import { DeployHistory } from '../src/deploy/history';
import { runDeploy, type DeployCommandRunner } from '../src/deploy/runner';

describe('decideDeploy', () => {
  it('deploys production on push to main', () => {
    const out = decideDeploy({ ref: 'refs/heads/main', before: 'a', after: 'b' });
    expect(out).toMatchObject({ action: 'deploy', env: 'production', branch: 'main', commit: 'b' });
  });

  it('deploys staging on push to staging', () => {
    const out = decideDeploy({ ref: 'refs/heads/staging', before: 'a', after: 'b' });
    expect(out).toMatchObject({ action: 'deploy', env: 'staging' });
  });

  it('deploys staging on push to claude/* branches', () => {
    const out = decideDeploy({
      ref: 'refs/heads/claude/setup-qorium-build-agent-zA0l5',
      before: 'a',
      after: 'b',
    });
    expect(out).toMatchObject({
      action: 'deploy',
      env: 'staging',
      branch: 'claude/setup-qorium-build-agent-zA0l5',
    });
  });

  it('ignores unknown branches', () => {
    const out = decideDeploy({ ref: 'refs/heads/feature-x', before: 'a', after: 'b' });
    expect(out).toMatchObject({ action: 'ignore' });
  });

  it('ignores tag refs', () => {
    const out = decideDeploy({ ref: 'refs/tags/v1.0.0', before: 'a', after: 'b' });
    expect(out).toMatchObject({ action: 'ignore' });
  });

  it('ignores deletions (after = zero sha)', () => {
    const out = decideDeploy({
      ref: 'refs/heads/main',
      before: 'a',
      after: '0000000000000000000000000000000000000000',
    });
    expect(out).toMatchObject({ action: 'ignore', reason: expect.stringMatching(/deletion/) });
  });

  it('ignores deletions (deleted=true)', () => {
    const out = decideDeploy({ ref: 'refs/heads/main', before: 'a', after: 'b', deleted: true });
    expect(out).toMatchObject({ action: 'ignore' });
  });

  it('ignores forced pushes', () => {
    const out = decideDeploy({ ref: 'refs/heads/main', before: 'a', after: 'b', forced: true });
    expect(out).toMatchObject({ action: 'ignore', reason: expect.stringMatching(/force/) });
  });

  it('ignores fork pushes', () => {
    const out = decideDeploy({
      ref: 'refs/heads/main',
      before: 'a',
      after: 'b',
      repository: { fork: true },
    });
    expect(out).toMatchObject({ action: 'ignore', reason: expect.stringMatching(/fork/) });
  });
});

describe('verifyGitHubSignature', () => {
  const SECRET = 'test-webhook-secret';
  it('accepts a correctly-signed body', () => {
    const body = JSON.stringify({ ref: 'refs/heads/main' });
    expect(verifyGitHubSignature(body, signGitHubBody(body, SECRET), SECRET)).toBe(true);
  });
  it('rejects an unsigned body', () => {
    expect(verifyGitHubSignature('x', undefined, SECRET)).toBe(false);
  });
  it('rejects a wrong-secret signature', () => {
    const body = '{}';
    expect(verifyGitHubSignature(body, signGitHubBody(body, 'other-secret'), SECRET)).toBe(false);
  });
  it('rejects malformed signature header', () => {
    expect(verifyGitHubSignature('x', 'not-sha256-prefixed', SECRET)).toBe(false);
  });
});

describe('DeployHistory', () => {
  const baseEntry = {
    id: 'h1',
    trigger: 'webhook' as const,
    ok: true,
    env: 'staging' as const,
    branch: 'main',
    commit: 'abc',
    startedAt: '2026-05-03T20:00:00Z',
    finishedAt: '2026-05-03T20:01:00Z',
    durationMs: 60_000,
    exitCode: 0,
    stdout: '',
    stderr: '',
  };

  it('records latest first', () => {
    const h = new DeployHistory(5);
    h.record({ ...baseEntry, id: 'a' });
    h.record({ ...baseEntry, id: 'b' });
    expect(h.latest()?.id).toBe('b');
    expect(h.list()[0]?.id).toBe('b');
    expect(h.list()[1]?.id).toBe('a');
  });

  it('respects capacity (drops oldest)', () => {
    const h = new DeployHistory(2);
    h.record({ ...baseEntry, id: 'a' });
    h.record({ ...baseEntry, id: 'b' });
    h.record({ ...baseEntry, id: 'c' });
    expect(h.list().map((e) => e.id)).toEqual(['c', 'b']);
  });

  it('returns null on empty history', () => {
    expect(new DeployHistory().latest()).toBe(null);
  });
});

describe('runDeploy', () => {
  it('calls the deploy script with the env+branch+commit args', async () => {
    let captured: { cmd: string; args: string[]; env: NodeJS.ProcessEnv } | null = null;
    const command: DeployCommandRunner = async (cmd, args, opts) => {
      captured = { cmd, args, env: opts.env };
      return { code: 0, stdout: 'ok', stderr: '' };
    };
    const out = await runDeploy({
      env: 'production',
      branch: 'main',
      commit: 'abc1234',
      cwd: '/opt/qorium',
      scriptPath: '/opt/qorium/services/setu/bin/setu-deploy.sh',
      command,
    });
    expect(out.ok).toBe(true);
    expect(out.exitCode).toBe(0);
    expect(captured?.cmd).toBe('/opt/qorium/services/setu/bin/setu-deploy.sh');
    expect(captured?.args).toEqual(['production', 'main', 'abc1234']);
    expect(captured?.env.SETU_DEPLOY_ENV).toBe('production');
    expect(captured?.env.SETU_DEPLOY_BRANCH).toBe('main');
    expect(captured?.env.SETU_DEPLOY_COMMIT).toBe('abc1234');
  });

  it('returns ok=false on non-zero exit', async () => {
    const command: DeployCommandRunner = async () => ({
      code: 1,
      stdout: '',
      stderr: 'pnpm install failed',
    });
    const out = await runDeploy({
      env: 'staging',
      branch: 'staging',
      commit: 'abc',
      cwd: '/x',
      scriptPath: '/x/setu-deploy.sh',
      command,
    });
    expect(out.ok).toBe(false);
    expect(out.exitCode).toBe(1);
    expect(out.stderr).toContain('pnpm install failed');
  });
});
