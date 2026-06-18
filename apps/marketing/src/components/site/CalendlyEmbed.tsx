'use client';

import * as React from 'react';
import Script from 'next/script';
import { analyticsAttributes, analyticsEvents } from '@/lib/analytics';

interface CalendlyEmbedProps {
  url: string;
  height?: number;
}

export function CalendlyEmbed({ url, height = 760 }: CalendlyEmbedProps) {
  return (
    <>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mb-3 inline-flex items-center rounded-md border border-border px-3 py-2 text-sm font-semibold text-secondary hover:bg-muted"
        {...analyticsAttributes(analyticsEvents.calendlyBookingOutboundClick, {
          surface: 'demo_calendly_embed',
        })}
      >
        Open Calendly in a new tab
      </a>
      <div
        className="calendly-inline-widget rounded-lg border border-border bg-background"
        data-url={url}
        style={{ minWidth: '320px', height: `${height}px` }}
      />
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
    </>
  );
}
