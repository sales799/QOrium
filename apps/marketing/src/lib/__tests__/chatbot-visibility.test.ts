import { describe, expect, it } from 'vitest';
import { shouldShowChatbot } from '../chatbot-visibility';

describe('chatbot visibility', () => {
  it('shows on marketing pages', () => {
    expect(shouldShowChatbot('/')).toBe(true);
    expect(shouldShowChatbot('/pricing')).toBe(true);
  });

  it('hides on Responsible AI, admin, and authenticated surfaces', () => {
    expect(shouldShowChatbot('/responsible-ai')).toBe(false);
    expect(shouldShowChatbot('/llm-info')).toBe(false);
    expect(shouldShowChatbot('/admin/users')).toBe(false);
    expect(shouldShowChatbot('/app/dashboard')).toBe(false);
    expect(shouldShowChatbot('/candidate/test')).toBe(false);
  });
});
