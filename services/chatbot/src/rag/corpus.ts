import type { CorpusChunk } from './types.js';

export const defaultCorpusChunks: CorpusChunk[] = [
  {
    id: 'platform-readybank',
    title: 'ReadyBank',
    url: '/platform/readybank',
    content:
      'ReadyBank is QOrium’s assessment library surface for skill-wise question packs and evidence-gated calibration status.',
  },
  {
    id: 'platform-jd-forge',
    title: 'JD-Forge',
    url: '/platform/jd-forge',
    content:
      'JD-Forge turns a job description into a structured assessment draft that a recruiter reviews before publishing.',
  },
  {
    id: 'platform-stack-vault',
    title: 'Stack-Vault',
    url: '/platform/stack-vault',
    content:
      'Stack-Vault is the customer-exclusive QOrium surface for private, watermarked assessment content.',
  },
  {
    id: 'method-qorium',
    title: 'The QOrium Method',
    url: '/method',
    content:
      'The QOrium Method combines AI drafting, expert review, calibration, release discipline, and post-deploy monitoring.',
  },
  {
    id: 'anti-leak',
    title: 'Anti-Leak, Explained',
    url: '/anti-leak',
    content:
      'QOrium’s anti-leak doctrine uses rotation, retirement, regeneration, and per-candidate watermarking to reduce stale assessment-bank risk.',
  },
  {
    id: 'responsible-ai',
    title: 'Responsible AI',
    url: '/responsible-ai',
    content:
      'QOrium separates shipped, beta, and roadmap AI features. The chatbot must say no when a requested capability is not shipped.',
  },
  {
    id: 'pricing',
    title: 'Pricing',
    url: '/pricing',
    content:
      'QOrium pricing is routed to sales until founder-approved public plan numbers are live. The chatbot does not quote custom prices.',
  },
  {
    id: 'security',
    title: 'Security',
    url: '/security',
    content:
      'QOrium publishes evidence-gated security and compliance language. Certifications render only after evidence lands.',
  },
];
