'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

type PlausibleWindow = Window & {
  plausible?: (name: string, options?: { props?: Record<string, unknown> }) => void;
};

function track(event: string, props: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  (window as PlausibleWindow).plausible?.(event, { props });
}

export function TrustPageView({ page }: { page: string }) {
  const pathname = usePathname();

  useEffect(() => {
    track('trust_page_view', { page, page_path: pathname });
  }, [page, pathname]);

  return null;
}

export function TrustTrackedLink({
  children,
  className,
  event,
  href,
  label,
}: {
  children: ReactNode;
  className?: string;
  event: 'trust_evidence_clicked' | 'trust_demo_cta_click' | 'dpia_download_attempt';
  href: string;
  label: string;
}) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={className}
      onClick={() => track(event, { label, href, page_path: pathname })}
    >
      {children}
    </Link>
  );
}
