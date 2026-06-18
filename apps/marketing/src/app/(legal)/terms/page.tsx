import type { Metadata } from 'next';
import { LegalShell, LegalSection } from '@/components/site/LegalShell';
import { siteConfig } from '@/content/site.config';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `${siteConfig.name} terms of service for assessment content licensing, acceptable use, customer responsibilities, confidentiality, billing, and service limits.`,
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" effectiveDate="2026-05-01">
      <LegalSection title="1. Acceptance">
        <p>
          By accessing or using {siteConfig.name} (the &ldquo;Service&rdquo;), you agree to these
          terms. If you do not agree, do not use the Service.
        </p>
      </LegalSection>
      <LegalSection title="2. The Service">
        <p>
          {siteConfig.name} is a Question-Bank-as-a-Service platform offered by{' '}
          {siteConfig.legalEntity}. The three SKUs (ReadyBank, JD-Forge, Stack-Vault) are described
          on the Pricing page; final terms are in your signed order form.
        </p>
      </LegalSection>
      <LegalSection title="3. Acceptable use">
        <p>
          You will not (a) republish or resell QOrium-authored questions, (b) use the Service to
          train competing AI models, (c) attempt to bypass anti-leak watermarking, (d) reverse
          engineer the API or underlying systems, or (e) use the Service for any unlawful purpose.
        </p>
      </LegalSection>
      <LegalSection title="4. License">
        <p>
          ReadyBank questions are licensed for use within your assessment workflows under the terms
          of your subscription. JD-Forge output may be used for the hiring drives it was generated
          for; Enterprise tier output carries an explicit IP-protection guarantee. Stack-Vault
          questions are exclusively yours under the contractual exclusivity outlined in the order
          form.
        </p>
      </LegalSection>
      <LegalSection title="5. Anti-leak SLA">
        <p>
          Anti-leak rotation cadence is set per tier (see Security page). If a ReadyBank question
          you have access to is independently verified as leaked, an updated variant is shipped per
          the SLA window and the original retired.
        </p>
      </LegalSection>
      <LegalSection title="6. Fees and refunds">
        <p>
          Fees are stated in your order form. We bill in advance for subscriptions, in arrears for
          usage-based metering. Pilot pricing terms are governed by the pilot agreement. Refunds are
          available within 30 days of initial payment for unused credits.
        </p>
      </LegalSection>
      <LegalSection title="7. Confidentiality">
        <p>
          Both parties agree to keep confidential information confidential. Stack-Vault libraries
          are confidential to the customer by design and not disclosed to other parties.
        </p>
      </LegalSection>
      <LegalSection title="8. Liability">
        <p>
          Our aggregate liability is capped at the fees paid in the prior 12 months. We are not
          liable for indirect or consequential damages.
        </p>
      </LegalSection>
      <LegalSection title="9. Termination">
        <p>
          Either party may terminate for material breach not cured within 30 days. On termination,
          we provide a 30-day export window. After that, customer data is deleted per the Privacy
          Policy retention schedule.
        </p>
      </LegalSection>
      <LegalSection title="10. Governing law">
        <p>
          These terms are governed by the laws of India. Disputes will be resolved in Bengaluru,
          Karnataka. International customers may have additional rights under their local laws.
        </p>
      </LegalSection>
      <LegalSection title="11. Changes">
        <p>
          We may update these terms; material changes are notified to active customers with 30 days
          notice. Continued use constitutes acceptance.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
