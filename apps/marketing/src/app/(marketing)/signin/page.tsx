import type { Metadata } from 'next';
import Link from 'next/link';
import { KeyRound, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MaxWidth } from '@/components/site/MaxWidth';
import { FadeIn } from '@/components/motion/FadeIn';

export const metadata: Metadata = {
  title: 'Sign in',
  description:
    'Access QOrium customer and pilot workspaces through secure onboarding links, account-owner support, and private workspace walkthrough paths.',
  alternates: { canonical: '/signin' },
};

export default function SignInPage() {
  return (
    <section className="surface-shell evidence-ledger border-t border-white/10 py-24">
      <MaxWidth as="div">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <Badge>
            <KeyRound className="size-3" /> Workspace access
          </Badge>
          <h1 className="mt-5 text-display-2 font-semibold text-white text-balance">
            Sign in through your QOrium onboarding channel.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-shell-muted">
            QOrium workspaces are issued to active pilots and customers. If your team already has
            access, use the onboarding link sent by your account owner. If you need access restored,
            contact the team and include your company domain.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="primary" size="lg">
              <Link href="/contact">Request access help</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/demo">Book a workspace walkthrough</Link>
            </Button>
          </div>
          <p className="mt-8 inline-flex items-center gap-2 text-xs text-shell-muted">
            <ShieldCheck className="size-4 text-signal-300" />
            Public self-serve login is not exposed on the marketing domain.
          </p>
        </FadeIn>
      </MaxWidth>
    </section>
  );
}
