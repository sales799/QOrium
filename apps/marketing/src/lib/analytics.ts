export const analyticsEvents = {
  heroCtaClick: 'hero_cta_click',
  pricingCtaClick: 'pricing_cta_click',
  comparePageCtaClick: 'compare_page_cta_click',
  samplePackUnlock: 'sample_pack_unlock',
  jdForgeDemoStart: 'jd_forge_demo_start',
  jdForgeDemoComplete: 'jd_forge_demo_complete',
  gradedAnswerDemoInteraction: 'graded_answer_demo_interaction',
  contactFormSubmit: 'contact_form_submit',
  calendlyBookingOutboundClick: 'calendly_booking_outbound_click',
} as const;

export type AnalyticsEventName = (typeof analyticsEvents)[keyof typeof analyticsEvents];
export type AnalyticsProps = Record<string, string | number | undefined>;

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, string | number> }) => void;
  }
}

export function cleanAnalyticsProps(props: AnalyticsProps = {}) {
  return Object.fromEntries(
    Object.entries(props).filter((entry): entry is [string, string | number] => {
      const [, value] = entry;
      return typeof value === 'string' || typeof value === 'number';
    }),
  );
}

export function analyticsAttributes(eventName?: AnalyticsEventName, props: AnalyticsProps = {}) {
  if (!eventName) return {};

  const cleanProps = cleanAnalyticsProps(props);
  return {
    'data-qorium-event': eventName,
    ...(Object.keys(cleanProps).length > 0
      ? { 'data-qorium-props': JSON.stringify(cleanProps) }
      : {}),
  };
}

export function trackPlausible(eventName: AnalyticsEventName, props: AnalyticsProps = {}) {
  if (typeof window === 'undefined' || typeof window.plausible !== 'function') return;

  window.plausible(eventName, { props: cleanAnalyticsProps(props) });
}
