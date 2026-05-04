import Link from 'next/link';
import { Github, Linkedin } from 'lucide-react';

import { Logo } from './Logo';
import { MaxWidth } from './MaxWidth';
import { siteConfig } from '@/content/site.config';

const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: 'Platform overview', href: '/product' },
      { label: 'ReadyBank', href: '/features/readybank' },
      { label: 'JD-Forge', href: '/features/jd-forge' },
      { label: 'Stack-Vault', href: '/features/stack-vault' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    heading: 'Solutions',
    links: [
      { label: 'For platforms', href: '/solutions/platforms' },
      { label: 'For enterprises', href: '/solutions/enterprises' },
      { label: 'For staffing firms', href: '/solutions/staffing' },
      { label: 'Customers', href: '/customers' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Security', href: '/security' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Book a demo', href: '/demo' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'DPA', href: '/dpa' },
    ],
  },
];

const BUILT_ON = ['PostgreSQL 16', 'Redis 7', 'Judge0', 'Anthropic', 'Cloudflare R2'];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface-1">
      <MaxWidth as="div" className="py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">{siteConfig.description}</p>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Built on
            </p>
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
              {BUILT_ON.map((b) => (
                <li key={b} className="rounded-pill border border-border px-2 py-0.5">
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:col-span-8 lg:grid-cols-5">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {col.heading}
                </p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-sm text-foreground/80 transition-colors hover:text-signal-300"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.legalEntity}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href={siteConfig.social.linkedin}
              className="hover:text-foreground"
              aria-label="LinkedIn"
              rel="noopener"
              target="_blank"
            >
              <Linkedin className="size-4" />
            </a>
            <a
              href={siteConfig.social.github}
              className="hover:text-foreground"
              aria-label="GitHub"
              rel="noopener"
              target="_blank"
            >
              <Github className="size-4" />
            </a>
          </div>
        </div>
      </MaxWidth>
    </footer>
  );
}
