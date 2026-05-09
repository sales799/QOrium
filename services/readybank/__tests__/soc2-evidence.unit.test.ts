import { describe, expect, it } from 'vitest';
import { classifyEventType } from '../src/scripts/soc2-evidence-pull.js';

describe('classifyEventType', () => {
  it('routes auth.* to "auth"', () => {
    expect(classifyEventType('auth.login_success')).toBe('auth');
    expect(classifyEventType('auth.session_revoked')).toBe('auth');
  });

  it('routes leak.* to "leak"', () => {
    expect(classifyEventType('leak.detected')).toBe('leak');
    expect(classifyEventType('leak.dismissed')).toBe('leak');
  });

  it('routes api_key.* to "api_key_rotation"', () => {
    expect(classifyEventType('api_key.rotated')).toBe('api_key_rotation');
    expect(classifyEventType('api_key.created')).toBe('api_key_rotation');
  });

  it('routes stack_vault.* to "stack_vault"', () => {
    expect(classifyEventType('stack_vault.question.uploaded')).toBe('stack_vault');
  });

  it('routes compliance.* to "compliance"', () => {
    expect(classifyEventType('compliance.export_requested')).toBe('compliance');
  });

  it('falls back to "other" for unrecognised event types', () => {
    expect(classifyEventType('reference_panel.token.minted')).toBe('other');
    expect(classifyEventType('cron.run')).toBe('other');
    expect(classifyEventType('foo')).toBe('other');
  });
});
