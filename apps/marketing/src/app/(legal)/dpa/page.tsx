import type { Metadata } from 'next';
import { LegalShell, LegalSection } from '@/components/site/LegalShell';
import { siteConfig } from '@/content/site.config';

export const metadata: Metadata = {
  title: 'Data Processing Addendum',
  description: `${siteConfig.name} data processing terms covering controller and processor roles, security measures, sub-processors, data subject requests, and breach notice commitments.`,
  alternates: { canonical: '/dpa' },
};

export default function DpaPage() {
  return (
    <LegalShell title="Data Processing Addendum" effectiveDate="2026-05-01">
      <LegalSection title="1. Purpose">
        <p>
          This Data Processing Addendum (&ldquo;DPA&rdquo;) supplements the Terms of Service between
          you (the &ldquo;Customer&rdquo;) and {siteConfig.legalEntity} (collectively, &ldquo;
          {siteConfig.name}&rdquo;) and applies to the processing of personal data in the provision
          of the Service.
        </p>
      </LegalSection>
      <LegalSection title="2. Roles">
        <p>
          Customer is the data controller of the personal data submitted to the Service.{' '}
          {siteConfig.name} is the data processor acting on Customer&rsquo;s documented
          instructions.
        </p>
      </LegalSection>
      <LegalSection title="3. Subject matter and duration">
        <p>
          The processing is the provision of question generation, question delivery, and analytics
          for the duration of the Customer&rsquo;s subscription.
        </p>
      </LegalSection>
      <LegalSection title="4. Categories of data">
        <p>
          Identifiers (name, email), professional context (company, role, hiring volume), assessment
          metadata (candidate session IDs, scores). No special category data is collected by
          default.
        </p>
      </LegalSection>
      <LegalSection title="5. Sub-processors">
        <p>
          The current list of sub-processors is at{' '}
          <a href="/security" className="text-signal-300 hover:underline">
            /security
          </a>
          . We provide 30-day prior written notice of any addition. Customer may object in writing
          within 14 days of notice; if the objection cannot be resolved, Customer may terminate the
          affected portion of the Service.
        </p>
      </LegalSection>
      <LegalSection title="6. Security measures">
        <p>
          {siteConfig.name} implements appropriate technical and organizational measures including
          encryption in transit (TLS 1.3) and at rest, access control via per-customer signed API
          keys, audit logging with 90-day retention, and segregated PostgreSQL schemas for
          Stack-Vault customers.
        </p>
      </LegalSection>
      <LegalSection title="7. Data subject requests">
        <p>
          {siteConfig.name} will assist Customer in responding to data subject requests (access,
          correction, erasure, portability) within applicable legal timelines, including DPDPA and
          GDPR.
        </p>
      </LegalSection>
      <LegalSection title="8. Personal data breach">
        <p>
          {siteConfig.name} will notify Customer without undue delay (within 72 hours) of becoming
          aware of a personal data breach affecting Customer data and provide reasonable assistance
          in fulfilling Customer&rsquo;s breach notification obligations.
        </p>
      </LegalSection>
      <LegalSection title="9. International transfers">
        <p>
          Where personal data is transferred outside India or the EEA, the transfer is governed by
          Standard Contractual Clauses or an equivalent legal mechanism. The current sub-processor
          list (/security) flags region for each provider.
        </p>
      </LegalSection>
      <LegalSection title="10. Audit">
        <p>
          {siteConfig.name} will make available to Customer (under NDA) information necessary to
          demonstrate compliance with this DPA, including SOC 2 reports once audited (status:
          in-progress).
        </p>
      </LegalSection>
      <LegalSection title="11. Return / deletion">
        <p>
          On termination or upon Customer&rsquo;s written request, {siteConfig.name} will return or
          delete Customer personal data within 30 days, except where retention is required by
          applicable law.
        </p>
      </LegalSection>
      <LegalSection title="12. Counsel review">
        <p>
          Final binding DPA language is delivered as part of the Customer&rsquo;s signed order form.
          This published version is informational and reflects {siteConfig.name}&rsquo;s intended
          posture.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
