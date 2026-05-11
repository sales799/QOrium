'use client';

import * as React from 'react';
import Script from 'next/script';

interface CalendlyEmbedProps {
  url: string;
  height?: number;
}

export function CalendlyEmbed({ url, height = 760 }: CalendlyEmbedProps) {
  return (
    <>
      <div
        className="calendly-inline-widget rounded-lg border border-border bg-background"
        data-url={url}
        style={{ minWidth: '320px', height: `${height}px` }}
      />
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
    </>
  );
}
