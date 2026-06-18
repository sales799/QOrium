import { describe, expect, it } from 'vitest';
import { markMarketingLeadMailStatus, recordMarketingLead } from '@/lib/lead-capture';

type QueryCall = {
  text: string;
  values: readonly unknown[];
};

function createFakeClient(rows: Array<Record<string, unknown>> = []) {
  const calls: QueryCall[] = [];

  return {
    calls,
    client: {
      async query<T>(text: string, values: readonly unknown[] = []) {
        calls.push({ text, values });
        return { rows: rows as T[] };
      },
    },
  };
}

describe('marketing lead capture', () => {
  it('records demo requests before mail delivery', async () => {
    const { calls, client } = createFakeClient([{ id: 'lead-123' }]);

    const result = await recordMarketingLead(client, {
      source: 'demo',
      name: 'Bhaskar Anand',
      email: ' Founder@Talpro.in ',
      company: 'Talpro',
      role: 'Founder',
      message: 'Need a careful pilot.',
      ipAddress: '203.0.113.7',
      userAgent: 'Playwright',
      metadata: {
        hiringVolume: '50-500',
        primarySku: 'readybank',
      },
    });

    expect(result).toEqual({ id: 'lead-123' });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.text).toContain('INSERT INTO app.marketing_leads');
    expect(calls[0]?.text).toContain('RETURNING id');
    expect(calls[0]?.values).toEqual([
      'demo',
      'Bhaskar Anand',
      'founder@talpro.in',
      'Talpro',
      'Founder',
      null,
      'Need a careful pilot.',
      '203.0.113.7',
      'Playwright',
      { hiringVolume: '50-500', primarySku: 'readybank' },
    ]);
  });

  it('updates mail delivery status after the durable record exists', async () => {
    const { calls, client } = createFakeClient();

    await markMarketingLeadMailStatus(client, 'lead-123', {
      status: 'sent',
      via: 'graph',
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.text).toContain('UPDATE app.marketing_leads');
    expect(calls[0]?.values).toEqual(['lead-123', 'sent', 'graph', null]);
  });
});
