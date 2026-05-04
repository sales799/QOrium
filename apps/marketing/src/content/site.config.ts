export const siteConfig = {
  name: 'Qorium',
  domain: 'qorium.online',
  url: process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://qorium.online',
  tagline: "The world's question bank for hiring.",
  description:
    'QOrium is the world’s first enterprise-grade Question-Bank-as-a-Service. IRT-calibrated, anti-leak-rotated, watermark-per-candidate libraries for assessment platforms, enterprise hiring teams, and recruiters.',
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
        label: 'Product',
        href: '/product',
        children: [
          {
            label: 'Platform overview',
            href: '/product',
            description: 'How QOrium works end-to-end.',
          },
          {
            label: 'ReadyBank',
            href: '/features/readybank',
            description: 'Shared, IRT-calibrated, anti-leak-rotated library.',
          },
          {
            label: 'JD-Forge',
            href: '/features/jd-forge',
            description: 'On-demand custom packs from any JD in 30 seconds.',
          },
          {
            label: 'Stack-Vault',
            href: '/features/stack-vault',
            description: 'Customer-exclusive, watermarked private library.',
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
            description: 'Stack-Vault for Bosch, TCS, BFSI majors.',
          },
          {
            label: 'For staffing firms',
            href: '/solutions/staffing',
            description: 'Per-JD packs and recruiter subscriptions.',
          },
        ],
      },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Security', href: '/security' },
      { label: 'Blog', href: '/blog' },
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
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
