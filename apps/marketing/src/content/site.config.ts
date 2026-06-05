export const siteConfig = {
  name: 'QOrium',
  domain: 'qorium.online',
  url: process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://qorium.online',
  tagline: "The world's question bank for hiring.",
  description:
    'QOrium is an India-built skills assessment platform for evidence-first hiring: IRT-calibrated, anti-leak-rotated, watermark-per-candidate library direction, JD-to-test workflows, and DPDP-aligned buyer guidance.',
  contactEmail: 'hello@qorium.online',
  legalEntity: 'Talpro India Pvt Ltd',
  social: {
    linkedin: 'https://www.linkedin.com/company/qorium',
    x: 'https://x.com/qorium',
    github: 'https://github.com/sales799/qorium',
  },
  nav: {
    primary: [
      {
        label: 'Platform',
        href: '/platform',
        children: [
          {
            label: 'Assessment Library',
            href: '/library',
            description: 'Browse skill assessments by role, category, and calibration status.',
          },
          {
            label: 'Platform overview',
            href: '/platform',
            description: 'How QOrium works end-to-end.',
          },
          {
            label: 'API access',
            href: '/platform/api',
            description: 'API docs are in beta; request access.',
          },
          {
            label: 'LLM info',
            href: '/llm-info',
            description: 'Plain-language product brief for AI assistants.',
          },
        ],
      },
      {
        label: 'Solutions',
        href: '/solutions/platforms',
        children: [
          {
            label: 'For platforms',
            href: '/solutions/platforms',
            description: 'HackerRank/Mettl-tier integrations via API.',
          },
          {
            label: 'For enterprises & GCCs',
            href: '/solutions/enterprises',
            description: 'Stack-Vault for enterprises, GCCs, and BFSI majors.',
          },
          {
            label: 'For staffing firms',
            href: '/solutions/staffing',
            description: 'Per-JD packs and recruiter subscriptions.',
          },
        ],
      },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Resources', href: '/resources' },
      { label: 'Security', href: '/security' },
    ],
    secondary: [
      { label: 'Customers', href: '/customers' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    legal: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'DPA', href: '/dpa' },
      { label: 'Cookies', href: '/cookie-policy' },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
