/**
 * Static catalogue of documentation sections rendered at build time.
 * Hand-curated to match `infra/API-Documentation-v0.md` table of contents.
 */

export interface DocSection {
  slug: string;
  title: string;
  summary: string;
  category: 'getting-started' | 'reference' | 'guides';
}

export const SECTIONS: DocSection[] = [
  {
    slug: 'overview',
    title: 'Overview',
    summary: 'Base URL, regional endpoints, TLS 1.3 requirement.',
    category: 'getting-started',
  },
  {
    slug: 'authentication',
    title: 'Authentication',
    summary: 'API keys, JWT tokens, HMAC-SHA256 request signing.',
    category: 'getting-started',
  },
  {
    slug: 'rate-limits',
    title: 'Rate limiting',
    summary: 'Per-tenant + per-key limits; 429 response shape.',
    category: 'getting-started',
  },
  {
    slug: 'errors',
    title: 'Error handling',
    summary: 'RFC 7807 problem JSON; status codes; retry guidance.',
    category: 'getting-started',
  },
  {
    slug: 'idempotency',
    title: 'Idempotency',
    summary: 'Idempotency-Key header; safe replays for mutating endpoints.',
    category: 'getting-started',
  },
  {
    slug: 'pagination',
    title: 'Pagination',
    summary: 'limit + offset; total count; next-page tokens.',
    category: 'getting-started',
  },
  {
    slug: 'readybank',
    title: 'ReadyBank',
    summary: 'Question search, packs, exports.',
    category: 'reference',
  },
  {
    slug: 'jd-forge',
    title: 'JD-Forge',
    summary: 'Real-time JD-based question generation orders.',
    category: 'reference',
  },
  {
    slug: 'stack-vault',
    title: 'Stack-Vault',
    summary: 'Per-customer namespace + watermarking.',
    category: 'reference',
  },
  {
    slug: 'webhooks',
    title: 'Webhooks',
    summary: 'Subscriptions CRUD, signed delivery, retry policy.',
    category: 'reference',
  },
  {
    slug: 'sso',
    title: 'SSO (SAML / OIDC)',
    summary: 'Enterprise authentication endpoints + tenant configuration.',
    category: 'reference',
  },
  {
    slug: 'audit-log',
    title: 'Audit Log',
    summary: 'Tenant-scoped read API for security + compliance events.',
    category: 'reference',
  },
  {
    slug: 'sdk-typescript',
    title: 'TypeScript SDK',
    summary: '@qorium/sdk — typed client + signing helper.',
    category: 'guides',
  },
  {
    slug: 'changelog',
    title: 'Changelog',
    summary: 'Versioned API changes; deprecation policy.',
    category: 'guides',
  },
];

export function findSection(slug: string): DocSection | null {
  return SECTIONS.find((s) => s.slug === slug) ?? null;
}

export function sectionsByCategory(): Record<DocSection['category'], DocSection[]> {
  return SECTIONS.reduce(
    (acc, s) => {
      acc[s.category].push(s);
      return acc;
    },
    {
      'getting-started': [] as DocSection[],
      reference: [] as DocSection[],
      guides: [] as DocSection[],
    },
  );
}
