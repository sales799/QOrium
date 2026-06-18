import { describe, expect, it } from 'vitest';

import { analyticsAttributes, analyticsEvents, cleanAnalyticsProps } from '@/lib/analytics';

describe('marketing analytics taxonomy', () => {
  it('keeps the required funnel events named and stable', () => {
    expect(Object.values(analyticsEvents)).toEqual([
      'hero_cta_click',
      'pricing_cta_click',
      'compare_page_cta_click',
      'sample_pack_unlock',
      'jd_forge_demo_start',
      'jd_forge_demo_complete',
      'graded_answer_demo_interaction',
      'contact_form_submit',
      'calendly_booking_outbound_click',
    ]);
  });

  it('drops undefined props before sending to Plausible', () => {
    expect(cleanAnalyticsProps({ surface: 'home', missing: undefined, count: 2 })).toEqual({
      surface: 'home',
      count: 2,
    });
  });

  it('renders safe data attributes for delegated tracking', () => {
    expect(analyticsAttributes(analyticsEvents.heroCtaClick, { surface: 'home_hero' })).toEqual({
      'data-qorium-event': 'hero_cta_click',
      'data-qorium-props': '{"surface":"home_hero"}',
    });
  });
});
