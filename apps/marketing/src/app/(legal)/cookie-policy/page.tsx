import type { Metadata } from 'next';
import { LegalShell, LegalSection } from '@/components/site/LegalShell';
import { siteConfig } from '@/content/site.config';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: `Cookie Policy for ${siteConfig.name}.`,
  alternates: { canonical: '/cookie-policy' },
};

export default function CookiePolicyPage() {
  return (
    <LegalShell title="Cookie Policy" effectiveDate="2026-05-01">
      <LegalSection title="1. What are cookies?">
        <p>
          Cookies are small text files stored on your device when you visit a website. They help
          sites remember your preferences and understand how visitors interact with content.
        </p>
      </LegalSection>
      <LegalSection title="2. Our approach">
        <p>
          {siteConfig.name} takes a privacy-first approach to analytics. We use{' '}
          <a
            href="https://plausible.io"
            className="text-signal-300 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Plausible Analytics
          </a>
          , a lightweight, open-source tool that does not use cookies and does not collect any
          personal data or personally identifiable information (PII). No cross-site tracking, no
          fingerprinting.
        </p>
      </LegalSection>
      <LegalSection title="3. Cookies we use">
        <p>
          <strong>Strictly necessary cookies:</strong> We use a single localStorage key
          (&ldquo;qorium-cookie-consent&rdquo;) to remember whether you have accepted or declined
          this notice. This is not a cookie in the technical HTTP sense, but we disclose it here for
          transparency.
        </p>
        <p className="mt-2">
          <strong>Third-party cookies:</strong> {siteConfig.name} does not load any third-party
          advertising, social-media, or tracking scripts. We do not set or allow third-party
          cookies.
        </p>
      </LegalSection>
      <LegalSection title="4. Managing cookies">
        <p>
          Because we do not use traditional cookies, there is nothing to clear in your browser
          settings related to {siteConfig.name}. If you wish to reset the consent banner, you may
          clear your browser&rsquo;s localStorage for this domain.
        </p>
      </LegalSection>
      <LegalSection title="5. Future changes">
        <p>
          If we add features that require cookies (for example, authentication or A/B testing), we
          will update this policy and re-prompt consent before setting any new cookies.
        </p>
      </LegalSection>
      <LegalSection title="6. Contact">
        <p>
          Questions about our cookie practices? Contact us at {siteConfig.contactEmail}. For broader
          privacy queries, see our{' '}
          <a href="/privacy" className="text-signal-300 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
