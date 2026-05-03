import { SECTIONS } from '@/lib/sections';

export default function Home() {
  return (
    <article>
      <h1 style={{ fontSize: 28, fontWeight: 600 }}>QOrium API documentation</h1>
      <p style={{ fontSize: 15, color: '#444', lineHeight: 1.6 }}>
        Welcome to the QOrium public REST API reference. The v0 surface ships ReadyBank (question
        library), JD-Forge (real-time generation), Stack-Vault (per-customer namespace), plus the
        platform plumbing for webhooks, SSO, and audit logging.
      </p>
      <p style={{ fontSize: 15, color: '#444', lineHeight: 1.6 }}>
        This site is a static reference compiled from the v0 spec at{' '}
        <code>infra/API-Documentation-v0.md</code>. For end-to-end examples, see the{' '}
        <a href="/sdk-typescript">TypeScript SDK guide</a>.
      </p>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18 }}>Quick start</h2>
        <pre
          style={{
            background: '#1a1a1a',
            color: '#f0f0f0',
            padding: 16,
            borderRadius: 8,
            fontSize: 12,
            overflowX: 'auto',
          }}
        >
          {`curl https://api.qorium.io/v1/questions \\
  -H "Authorization: Bearer qor_readybank_acme_<32hex>" \\
  -H "Accept: application/json"`}
        </pre>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18 }}>All sections</h2>
        <ul style={{ paddingLeft: 20 }}>
          {SECTIONS.map((s) => (
            <li key={s.slug} style={{ marginBottom: 6, fontSize: 14 }}>
              <a href={`/${s.slug}`}>{s.title}</a>
              <span style={{ color: '#888', marginLeft: 8 }}>— {s.summary}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
