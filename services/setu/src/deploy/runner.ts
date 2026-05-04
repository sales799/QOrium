/**
 * Deploy runner — executes the deploy script against the provided
 * environment. The actual command is shell-out (`bin/setu-deploy.sh`)
 * so the runner stays small + the shell script can be `set -euxo
 * pipefail` debuggable on the VPS without re-deploying Setu itself.
 *
 * The runner is injected with a `command` function so tests can
 * verify the exact command line + env passed without spawning a real
 * subprocess.
 */

import { spawn } from 'node:child_process';
import type { DeployEnv } from './policy.js';

export interface DeployCommandRunner {
  (
    cmd: string,
    args: string[],
    opts: { env: NodeJS.ProcessEnv; cwd: string; signal?: AbortSignal },
  ): Promise<{
    code: number;
    stdout: string;
    stderr: string;
  }>;
}

export const realCommandRunner: DeployCommandRunner = (cmd, args, opts) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      env: opts.env,
      cwd: opts.cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    if (opts.signal) {
      const onAbort = (): void => {
        child.kill('SIGTERM');
      };
      opts.signal.addEventListener('abort', onAbort, { once: true });
    }
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (chunk) => {
      stdout += chunk.toString('utf8');
    });
    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString('utf8');
    });
    child.once('error', reject);
    child.once('close', (code) => resolve({ code: code ?? -1, stdout, stderr }));
  });

export interface RunDeployInputs {
  env: DeployEnv;
  branch: string;
  commit: string;
  /** Repo root on the VPS. */
  cwd: string;
  /** Path to the deploy script. */
  scriptPath: string;
  /** Per-deploy timeout (ms). */
  timeoutMs?: number;
  /** Test seam. */
  command?: DeployCommandRunner;
}

export interface DeployOutcome {
  ok: boolean;
  env: DeployEnv;
  branch: string;
  commit: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  exitCode: number;
  stdout: string;
  stderr: string;
}

export async function runDeploy(inputs: RunDeployInputs): Promise<DeployOutcome> {
  const startedAt = new Date();
  const command = inputs.command ?? realCommandRunner;
  const ctrl = new AbortController();
  const timeout = inputs.timeoutMs ?? 10 * 60_000;
  const timer = setTimeout(() => ctrl.abort(), timeout);
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    SETU_DEPLOY_ENV: inputs.env,
    SETU_DEPLOY_BRANCH: inputs.branch,
    SETU_DEPLOY_COMMIT: inputs.commit,
  };
  try {
    const result = await command(inputs.scriptPath, [inputs.env, inputs.branch, inputs.commit], {
      env,
      cwd: inputs.cwd,
      signal: ctrl.signal,
    });
    const finishedAt = new Date();
    return {
      ok: result.code === 0,
      env: inputs.env,
      branch: inputs.branch,
      commit: inputs.commit,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      exitCode: result.code,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  } finally {
    clearTimeout(timer);
  }
}
