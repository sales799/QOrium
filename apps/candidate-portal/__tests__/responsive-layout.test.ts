import { describe, it, expect } from 'vitest';

import { runnerLayout, PHONE_MAX_WIDTH, TABLET_MAX_WIDTH } from '../src/lib/responsive-layout';

describe('runnerLayout', () => {
  it('returns the phone layout at and below the phone breakpoint', () => {
    const small = runnerLayout(320);
    expect(small.compact).toBe(true);
    expect(small.cardPadding).toBe(16);
    expect(small.sectionPadding).toBe('0 12px');

    const edge = runnerLayout(PHONE_MAX_WIDTH);
    expect(edge.compact).toBe(true);
    expect(edge.cardPadding).toBe(16);
  });

  it('returns the tablet layout between the phone and tablet breakpoints', () => {
    const justAbovePhone = runnerLayout(PHONE_MAX_WIDTH + 1);
    expect(justAbovePhone.compact).toBe(false);
    expect(justAbovePhone.cardPadding).toBe(20);
    expect(justAbovePhone.sectionMargin).toBe('20px auto');

    const edge = runnerLayout(TABLET_MAX_WIDTH);
    expect(edge.compact).toBe(false);
    expect(edge.cardPadding).toBe(20);
  });

  it('returns the desktop layout above the tablet breakpoint', () => {
    const desktop = runnerLayout(TABLET_MAX_WIDTH + 1);
    expect(desktop.compact).toBe(false);
    expect(desktop.cardPadding).toBe(26);
    expect(desktop.sectionMargin).toBe('28px auto');
    expect(desktop.sectionPadding).toBe('0 20px');
  });

  it('returns a typical wide-desktop width as desktop', () => {
    expect(runnerLayout(1440)).toEqual({
      compact: false,
      sectionMargin: '28px auto',
      sectionPadding: '0 20px',
      cardPadding: 26,
      bodyFontSize: 16,
      optionMinHeight: 0,
      navStack: false,
    });
  });

  it('degrades non-finite / non-positive / non-number widths to desktop (SSR-safe)', () => {
    const desktopCardPadding = 26;
    expect(runnerLayout(0).cardPadding).toBe(desktopCardPadding);
    expect(runnerLayout(-100).cardPadding).toBe(desktopCardPadding);
    expect(runnerLayout(Number.NaN).cardPadding).toBe(desktopCardPadding);
    expect(runnerLayout(Number.POSITIVE_INFINITY).cardPadding).toBe(desktopCardPadding);
    // @ts-expect-error — exercising the runtime guard for non-number input
    expect(runnerLayout(undefined).cardPadding).toBe(desktopCardPadding);
    // @ts-expect-error — exercising the runtime guard for non-number input
    expect(runnerLayout('640').cardPadding).toBe(desktopCardPadding);
  });

  it('font size shrinks monotonically from desktop to phone', () => {
    const phone = runnerLayout(360).bodyFontSize;
    const tablet = runnerLayout(700).bodyFontSize;
    const desktop = runnerLayout(1200).bodyFontSize;
    expect(phone).toBeLessThanOrEqual(tablet);
    expect(tablet).toBeLessThanOrEqual(desktop);
  });

  describe('mobile touch-target + stacked-nav tokens', () => {
    it('gives phone option labels a >=44px touch target and stacks the nav', () => {
      const phone = runnerLayout(360);
      expect(phone.optionMinHeight).toBeGreaterThanOrEqual(44);
      expect(phone.navStack).toBe(true);
    });

    it('gives tablet a comfortable touch target but keeps the nav inline', () => {
      const tablet = runnerLayout(700);
      expect(tablet.optionMinHeight).toBeGreaterThan(0);
      expect(tablet.navStack).toBe(false);
    });

    it('leaves desktop untouched — no minimum touch target, inline nav', () => {
      const desktop = runnerLayout(1200);
      expect(desktop.optionMinHeight).toBe(0);
      expect(desktop.navStack).toBe(false);
    });

    it('SSR / unknown width keeps the desktop (inline, no-min) behaviour', () => {
      const ssr = runnerLayout(0);
      expect(ssr.optionMinHeight).toBe(0);
      expect(ssr.navStack).toBe(false);
    });

    it('touch target grows monotonically from desktop to phone', () => {
      const phone = runnerLayout(360).optionMinHeight;
      const tablet = runnerLayout(700).optionMinHeight;
      const desktop = runnerLayout(1200).optionMinHeight;
      expect(desktop).toBeLessThanOrEqual(tablet);
      expect(tablet).toBeLessThanOrEqual(phone);
    });

    it('only the phone (compact) layout stacks the footer nav', () => {
      expect(runnerLayout(360).navStack).toBe(runnerLayout(360).compact);
      expect(runnerLayout(700).navStack).toBe(false);
      expect(runnerLayout(1200).navStack).toBe(false);
    });
  });
});
