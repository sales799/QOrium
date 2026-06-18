import type { Metadata } from 'next';
import { EmailText } from '@/components/site/EmailText';
import { LegalShell, LegalSection } from '@/components/site/LegalShell';
import { siteConfig } from '@/content/site.config';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `${siteConfig.name} privacy policy covering submitted form data, customer audit trails, analytics posture, retention, rights requests, and security practices.`,
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" effectiveDate="2026-05-01">
      <LegalSection title="1. Who we are">
        <p>
          {siteConfig.name} is operated by {siteConfig.legalEntity}, with registered office in
          Bengaluru, India. We can be reached at <EmailText address={siteConfig.contactEmail} />.
        </p>
      </LegalSection>
      <LegalSection title="2. What we collect">
        <p>
          We collect information you submit through forms (name, email, company, role, message),
          information necessary to provide the service (API key usage logs, customer audit trails,
          billing data), and minimal first-party analytics (no third-party tracking cookies, no
          fingerprinting).
        </p>
      </LegalSection>
      <LegalSection title="3. How we use it">
        <p>
          To respond to your inquiry, deliver the service you purchased, comply with legal
          obligations, and improve product quality. Stack-Vault customer data is handled under
          per-customer schema isolation and never combined with other customers&rsquo; libraries.
        </p>
      </LegalSection>
      <LegalSection title="4. Sub-processors">
        <p>
          A current list of sub-processors is available on the{' '}
          <a href="/security" className="text-signal-300 hover:underline">
            Security page
          </a>
          . We notify customers in writing 30 days before adding a new sub-processor handling
          personal data.
        </p>
      </LegalSection>
      <LegalSection title="5. Your rights">
        <p>
          Under DPDPA (India), GDPR (EU), and other applicable privacy laws, you have the right to
          access, correct, delete, or port your personal data. Contact us at{' '}
          <EmailText address={siteConfig.contactEmail} /> to exercise these rights. We respond
          within 30 days.
        </p>
      </LegalSection>
      <LegalSection title="6. Retention">
        <p>
          Audit logs: 90 days. Billing records: 7 years (statutory). Customer questions and
          libraries: retained for the duration of the engagement plus 30 days for orderly export,
          then deleted unless contractually extended.
        </p>
      </LegalSection>
      <LegalSection title="7. Security">
        <p>
          Transport: TLS 1.3 with HSTS. Storage: encrypted at rest. Access: per-customer signed API
          keys, audit-logged. See the{' '}
          <a href="/security" className="text-signal-300 hover:underline">
            Security page
          </a>{' '}
          for the full posture.
        </p>
      </LegalSection>
      <LegalSection title="8. Contact">
        <p>
          Privacy queries: <EmailText address={siteConfig.contactEmail} />. Grievance officer
          details and DPO contact will be published prior to public launch.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
