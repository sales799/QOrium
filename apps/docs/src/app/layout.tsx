import Link from 'next/link';
import type { ReactNode } from 'react';
import { sectionsByCategory } from '@/lib/sections';

export const metadata = {
  title: 'QOrium API documentation',
  description:
    'Public REST API reference for QOrium ReadyBank, JD-Forge, Stack-Vault, Webhooks, SSO, and Audit Log.',
};

export default function DocsLayout({ children }: { children: ReactNode }) {
  const categories = sectionsByCategory();
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          margin: 0,
          color: '#1a1a1a',
          background: '#fafafa',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh' }}>
          <aside
            style={{
              borderRight: '1px solid #e5e5e5',
              padding: '24px 16px',
              background: 'white',
              overflowY: 'auto',
            }}
          >
            <Link
              href="/"
              style={{ fontWeight: 600, fontSize: 16, color: '#111', textDecoration: 'none' }}
            >
              QOrium API docs
            </Link>
            <p style={{ marginTop: 4, fontSize: 11, color: '#666' }}>
              v0.1.0 · base URL: api.qorium.io/v1
            </p>

            <NavGroup title="Getting started" items={categories['getting-started']} />
            <NavGroup title="Reference" items={categories.reference} />
            <NavGroup title="Guides" items={categories.guides} />
          </aside>
          <main style={{ padding: '32px 48px', maxWidth: 900 }}>{children}</main>
        </div>
      </body>
    </html>
  );
}

interface NavGroupProps {
  title: string;
  items: { slug: string; title: string }[];
}

function NavGroup({ title, items }: NavGroupProps) {
  return (
    <nav style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 11, textTransform: 'uppercase', color: '#999', letterSpacing: 0.5 }}>
        {title}
      </h2>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
        {items.map((s) => (
          <li key={s.slug} style={{ marginBottom: 6 }}>
            <Link
              href={`/${s.slug}`}
              style={{
                color: '#1a1a1a',
                textDecoration: 'none',
                fontSize: 13,
                lineHeight: 1.4,
              }}
            >
              {s.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
