import type { Metadata } from 'next';
import { Mail, MapPin, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { MaxWidth } from '@/components/site/MaxWidth';
import { ContactForm } from '@/components/site/ContactForm';
import { FadeIn } from '@/components/motion/FadeIn';
import { Spotlight } from '@/components/aceternity/Spotlight';
import { siteConfig } from '@/content/site.config';
import { mailerStatus } from '@/lib/mailer';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Send us a note. We respond within one business day.',
};

export default function ContactPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink py-20 text-graphite-50">
        <Spotlight className="left-1/2 top-0 -translate-x-1/2 opacity-25" />
        <MaxWidth as="div" className="relative z-10">
          <FadeIn className="space-y-4">
            <Badge>Contact</Badge>
            <h1 className="max-w-3xl text-display-2 font-semibold text-balance">
              Tell us what you're trying to solve.
            </h1>
            <p className="max-w-2xl text-pretty text-graphite-300">
              We respond within one business day. Drop the JD count, the platforms you use, and the
              leak you can't stop, and we'll come back with the right SKU + tier.
            </p>
          </FadeIn>
        </MaxWidth>
      </section>

      <section className="border-t border-border/60 bg-background py-20">
        <MaxWidth as="div" className="grid gap-12 md:grid-cols-12">
          <aside className="md:col-span-4">
            <FadeIn className="space-y-6">
              <div className="space-y-2">
                <Mail className="size-5 text-signal-500" />
                <p className="text-sm font-medium text-foreground">Email</p>
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="font-mono text-sm text-muted-foreground hover:text-signal-300"
                >
                  {siteConfig.contactEmail}
                </a>
              </div>
              <div className="space-y-2">
                <MapPin className="size-5 text-signal-500" />
                <p className="text-sm font-medium text-foreground">HQ</p>
                <p className="text-sm text-muted-foreground">
                  Bengaluru, India
                  <br />
                  Talpro Universe
                </p>
              </div>
              <div className="space-y-2">
                <Clock className="size-5 text-signal-500" />
                <p className="text-sm font-medium text-foreground">Response time</p>
                <p className="text-sm text-muted-foreground">≤ 1 business day · IST 09:00–18:00</p>
              </div>
              {mailerStatus === 'console-fallback' ? (
                <p className="rounded-md border border-warning/40 bg-warning/5 p-3 text-xs text-warning">
                  Pre-launch: form submissions are logged for manual review until the mail provider
                  is configured.
                </p>
              ) : null}
            </FadeIn>
          </aside>
          <div className="md:col-span-8">
            <FadeIn>
              <div className="rounded-lg border border-border bg-surface-1 p-6 md:p-8">
                <ContactForm />
              </div>
            </FadeIn>
          </div>
        </MaxWidth>
      </section>
    </>
  );
}
