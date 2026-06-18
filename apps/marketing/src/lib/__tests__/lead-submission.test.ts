import { describe, expect, it } from 'vitest';

import { ContactSchema, DemoSchema } from '@/lib/lead-submission';

describe('marketing lead submission validation', () => {
  it('allows optional demo fields to be left empty by the browser form', () => {
    const parsed = DemoSchema.safeParse({
      name: 'Bhaskar Anand',
      email: 'bhaskar@example.com',
      company: 'Talpro',
      role: '',
      hiringVolume: '',
      primarySku: '',
      message: '',
      website: '',
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toMatchObject({
        name: 'Bhaskar Anand',
        email: 'bhaskar@example.com',
        company: 'Talpro',
      });
      expect(parsed.data.hiringVolume).toBeUndefined();
      expect(parsed.data.primarySku).toBeUndefined();
      expect(parsed.data.message).toBeUndefined();
    }
  });

  it('keeps the honeypot active for contact submissions', () => {
    const parsed = ContactSchema.safeParse({
      name: 'Jane Engineer',
      email: 'jane@example.com',
      message: 'We need help validating hiring assessments.',
      website: 'bot-filled',
    });

    expect(parsed.success).toBe(false);
  });
});
