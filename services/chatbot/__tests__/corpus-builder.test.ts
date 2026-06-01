import { describe, expect, it } from 'vitest';
import { chunksFromMarketingPages } from '../src/rag/build.js';

describe('corpus builder', () => {
  it('turns shipped marketing pages into stable cited chunks', () => {
    const chunks = chunksFromMarketingPages([
      {
        url: '/method',
        title: 'The QOrium Method',
        body: 'AI draft. Expert review. Calibration. Release. Post-deploy monitoring.',
      },
      {
        url: '/responsible-ai',
        title: 'Responsible AI',
        body: 'Shipped, beta, and roadmap capabilities are separated honestly.',
      },
    ]);

    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toMatchObject({
      id: 'page-method-0',
      url: '/method',
      title: 'The QOrium Method',
    });
    expect(chunks[0]?.content).not.toContain('\n');
    expect(chunks[1]?.id).toBe('page-responsible-ai-0');
  });
});
