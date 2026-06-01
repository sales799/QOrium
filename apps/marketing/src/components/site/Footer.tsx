import Link from 'next/link';
import { Github, Linkedin, ShieldCheck } from 'lucide-react';

import { footerSitemap, visibleLinks } from '@/content/marketing-ia';
import { siteConfig } from '@/content/site.config';
import { Logo } from './Logo';
import { MaxWidth } from './MaxWidth';
import { NewsletterSignup } from './NewsletterSignup';

const BUILT_ON = ['PostgreSQL 16', 'Redis 7', 'Next.js 15', 'Cloudflare', 'PM2'];

export function Footer() {
  return (
    <footer className="surface-shell border-t border-white/10">
      <MaxWidth as="div" className="py-14">
        <div className="grid gap-10 lg:grid-cols-[20rem_1fr]">
          <div>
            <Logo className="text-white" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-shell-muted">
              {siteConfig.description}
            </p>

            <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck className="size-4 text-signal-300" />
                Evidence-gated by default
              </div>
              <p className="mt-2 text-xs leading-5 text-shell-muted">
                Proof modules stay hidden until the underlying flag and evidence are present.
              </p>
            </div>

            <div className="mt-6">
              <p className="font-mono text-xs font-semibold uppercase text-shell-muted">
                Stay in the loop
              </p>
              <div className="mt-2 max-w-sm">
                <NewsletterSignup />
              </div>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {footerSitemap.map((column) => {
              const links = visibleLinks(column.links);

              if (links.length === 0) {
                return null;
              }

              return (
                <div key={column.heading}>
                  <p className="font-mono text-xs font-semibold uppercase text-shell-muted">
                    {column.heading}
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {links.map((link) => (
                      <li key={`${column.heading}-${link.href}`}>
                        <Link
                          href={link.href}
                          className="text-sm leading-5 text-white/80 transition-colors hover:text-signal-300"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-2 border-t border-white/10 pt-6">
          {BUILT_ON.map((item) => (
            <span
              key={item}
              className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-xs text-shell-muted"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-shell-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.legalEntity}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href={siteConfig.social.linkedin}
              className="text-shell-muted transition-colors hover:text-white"
              aria-label="LinkedIn"
              rel="noopener"
              target="_blank"
            >
              <Linkedin className="size-4" />
            </a>
            <a
              href={siteConfig.social.github}
              className="text-shell-muted transition-colors hover:text-white"
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
