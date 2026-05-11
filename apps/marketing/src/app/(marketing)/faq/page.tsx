import type { Metadata } from 'next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { MaxWidth } from '@/components/site/MaxWidth';
import { Reveal } from '@/components/motion/Reveal';
import { FAQPageJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/content/site.config';

const GENERAL_FAQ = [
  {
    question: 'How is QOrium different from HackerRank or Mettl?',
    answer:
      "They run assessments. We supply the questions that power them. We don't compete with HackerRank or Mettl — we make their content libraries fresher and harder to leak. We're a content layer, not a platform.",
  },
  {
    question: 'What does "anti-leak rotation" actually mean?',
    answer:
      'Continuous monitoring of public sources (Glassdoor, LeetCode, Reddit, GeeksforGeeks). When a question surfaces, an AI generates a semantic variant, an SME validates, the variant releases as v2, and the original retires. ReadyBank rotates 15% of the library quarterly.',
  },
  {
    question: 'Can I get a Stack-Vault contractually exclusive to my company?',
    answer:
      'Yes. Stack-Vault is the SKU for that. No question in your Stack-Vault appears in ReadyBank, in any other Stack-Vault, or in any JD-Forge output to another customer. Watermarking enables forensic attribution if anything leaks.',
  },
  {
    question: 'How fast is JD-Forge?',
    answer:
      "Standard tier: 30 seconds, AI-only. Reviewed tier: 4 hours, AI plus human SME. Enterprise tier adds an IP-protection guarantee — your generated pack never enters ReadyBank or any other customer's output.",
  },
  {
    question: 'Where do you stand on bias and validation?',
    answer:
      'Every question gets a self-critique pass against ambiguity, distractor quality, edge cases, bias, and leak risk. SME review is mandatory for ReadyBank and Stack-Vault. The reference panel calibrates difficulty empirically.',
  },
];

const PRICING_FAQ = [
  {
    question: 'Why are prices ranges, not single SKUs?',
    answer:
      'Each tier is calibrated to your hiring volume, anti-leak SLA, and refresh cadence. We publish anchors so you can size internally. Final pricing comes after a 30-minute scoping call.',
  },
  {
    question: 'Do you offer pilot pricing?',
    answer:
      'Yes. Three-month pilots at 30% off the smallest tier of any SKU, capped at one renewal cycle.',
  },
  {
    question: 'India pricing vs USD pricing?',
    answer:
      "Both lists are valid. INR for India-billed customers, USD for international. We don't arbitrage — the headline rate is comparable at the prevailing FX.",
  },
  {
    question: 'What happens if a question I bought leaks?',
    answer:
      'For ReadyBank: covered by anti-leak SLA — affected questions are auto-rotated and replaced. For Stack-Vault: forensic attribution identifies origin; contractual remedies apply.',
  },
  {
    question: 'Annual vs monthly?',
    answer:
      'Annual billing has a 15% discount for ReadyBank Recruiter and JD-Forge subscriptions. Stack-Vault is annual-only by design.',
  },
];

const ALL_FAQ = [...GENERAL_FAQ, ...PRICING_FAQ];

export const metadata: Metadata = {
  title: 'FAQ',
  description: `Frequently asked questions about ${siteConfig.name} — the world's first Question-Bank-as-a-Service for technical hiring.`,
  alternates: { canonical: '/faq' },
};

export default function FAQPage() {
  return (
    <section className="bg-background">
      <FAQPageJsonLd questions={ALL_FAQ} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'FAQ', path: '/faq' },
        ]}
      />
      <MaxWidth as="div" className="py-20">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Frequently asked questions
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-foreground">
              What people ask before they buy.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Can&rsquo;t find your answer?{' '}
              <a href="/contact" className="text-secondary hover:underline">
                Get in touch
              </a>
              .
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-14 max-w-3xl">
          <Reveal>
            <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              General
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {GENERAL_FAQ.map((item, i) => (
                <AccordionItem key={i} value={`general-${i}`}>
                  <AccordionTrigger className="text-left text-base font-medium">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>

          <Reveal>
            <h2 className="mb-4 mt-12 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Pricing
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {PRICING_FAQ.map((item, i) => (
                <AccordionItem key={i} value={`pricing-${i}`}>
                  <AccordionTrigger className="text-left text-base font-medium">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </MaxWidth>
    </section>
  );
}
