'use client';

import * as React from 'react';
import { trackPlausible, type AnalyticsEventName, type AnalyticsProps } from '@/lib/analytics';

function parseProps(value: string | null): AnalyticsProps {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string | number] => {
        const [, propValue] = entry;
        return typeof propValue === 'string' || typeof propValue === 'number';
      }),
    );
  } catch {
    return {};
  }
}

function getTrackedElement(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>('[data-qorium-event]');
}

export function AnalyticsEvents() {
  React.useEffect(() => {
    function handleClick(event: MouseEvent) {
      const element = getTrackedElement(event.target);
      if (!element) return;

      const eventName = element.dataset['qoriumEvent'] as AnalyticsEventName | undefined;
      if (!eventName) return;

      trackPlausible(eventName, {
        ...parseProps(element.dataset['qoriumProps'] ?? null),
        interaction: 'click',
      });
    }

    function handleSubmit(event: SubmitEvent) {
      const element = event.target instanceof HTMLElement ? event.target : null;
      if (!element) return;

      const eventName = element.dataset['qoriumEvent'] as AnalyticsEventName | undefined;
      if (!eventName) return;

      trackPlausible(eventName, {
        ...parseProps(element.dataset['qoriumProps'] ?? null),
        interaction: 'submit',
      });
    }

    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleSubmit);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleSubmit);
    };
  }, []);

  return null;
}
