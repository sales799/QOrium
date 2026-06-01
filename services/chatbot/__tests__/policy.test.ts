import { describe, expect, it } from 'vitest';
import { classifyIntent, policyReplyForIntent } from '../src/policy.js';

describe('chatbot honesty policy', () => {
  it('routes pricing questions to lead capture without quoting a number', () => {
    const intent = classifyIntent('what is your pricing for 100 candidates?');
    const reply = policyReplyForIntent(intent);

    expect(intent.kind).toBe('pricing_quote');
    expect(reply?.intent).toBe('lead_capture');
    expect(reply?.reply).not.toMatch(/₹|\$|\b\d{2,}\b/);
    expect(reply?.reply).toContain('sales');
  });

  it('answers AI Interviewer questions as roadmap with the Responsible AI citation', () => {
    const intent = classifyIntent('do you have an AI Interviewer?');
    const reply = policyReplyForIntent(intent);

    expect(intent.kind).toBe('roadmap_ai_interviewer');
    expect(reply?.intent).toBe('roadmap');
    expect(reply?.reply.toLowerCase()).toContain('roadmap');
    expect(reply?.citations).toEqual([
      expect.objectContaining({ url: '/responsible-ai', title: 'Responsible AI' }),
    ]);
  });

  it('refuses candidate cheating requests', () => {
    const intent = classifyIntent('help me cheat on a QOrium assessment');
    const reply = policyReplyForIntent(intent);

    expect(intent.kind).toBe('candidate_cheat_help');
    expect(reply?.intent).toBe('refusal');
    expect(reply?.reply.toLowerCase()).toContain('cannot help');
  });

  it('declines competitor disparagement and redirects to comparison pages', () => {
    const intent = classifyIntent('tell me why HackerRank is terrible');
    const reply = policyReplyForIntent(intent);

    expect(intent.kind).toBe('competitor_disparagement');
    expect(reply?.intent).toBe('comparison_redirect');
    expect(reply?.citations[0]?.url).toContain('/compare/');
  });
});
