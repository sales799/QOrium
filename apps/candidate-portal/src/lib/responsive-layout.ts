// Pure presenter: maps a viewport width into the candidate-runner layout
// tokens (margins / paddings used by the inline-styled runner). No React, no
// DOM, no fetch. Leak-safe by construction — it only ever sees a number
// (viewport width) and emits CSS spacing values; it never touches a question
// body, score, correctness flag, or any candidate content.
//
// Three breakpoints:
//   - phone   (<= 480px): tight spacing, compact=true, stacked nav, large
//     touch targets
//   - tablet  (<= 768px): medium spacing, comfortable touch targets
//   - desktop (> 768px or unknown): the runner's original spacing (default)
//
// SSR-safe: a non-finite / non-positive width degrades to the desktop default
// so the first server render (no window) matches the historical layout and
// there is zero behavioural change until the client measures a real viewport.

export interface RunnerLayout {
  /** true on phone-sized viewports — lets the runner relax fixed widths. */
  compact: boolean;
  /** CSS `margin` for the question <section>. */
  sectionMargin: string;
  /** CSS `padding` for the question <section>. */
  sectionPadding: string;
  /** CSS `padding` (px number) for the question card. */
  cardPadding: number;
  /** font size (px) for the question body. */
  bodyFontSize: number;
  /**
   * Minimum height (px) for each MCQ option label so it is a comfortable
   * touch target on small screens (WCAG 2.5.5 / 2.5.8). 0 on desktop, where
   * a pointer is assumed and the original layout must stay pixel-identical.
   */
  optionMinHeight: number;
  /**
   * true on phone viewports — the runner stacks the footer navigation
   * buttons vertically (full-width via flex stretch) instead of placing them
   * side-by-side, which is cramped on a narrow screen.
   */
  navStack: boolean;
}

export const PHONE_MAX_WIDTH = 480;
export const TABLET_MAX_WIDTH = 768;

const DESKTOP: RunnerLayout = {
  compact: false,
  sectionMargin: '28px auto',
  sectionPadding: '0 20px',
  cardPadding: 26,
  bodyFontSize: 16,
  optionMinHeight: 0,
  navStack: false,
};

const TABLET: RunnerLayout = {
  compact: false,
  sectionMargin: '20px auto',
  sectionPadding: '0 16px',
  cardPadding: 20,
  bodyFontSize: 15.5,
  optionMinHeight: 40,
  navStack: false,
};

const PHONE: RunnerLayout = {
  compact: true,
  sectionMargin: '14px auto',
  sectionPadding: '0 12px',
  cardPadding: 16,
  bodyFontSize: 15,
  optionMinHeight: 44,
  navStack: true,
};

/**
 * Resolve the runner layout tokens for a given viewport width (px).
 * Unknown / non-finite / non-positive widths degrade to the desktop default.
 */
export function runnerLayout(viewportWidth: number): RunnerLayout {
  if (typeof viewportWidth !== 'number' || !Number.isFinite(viewportWidth) || viewportWidth <= 0) {
    return DESKTOP;
  }
  if (viewportWidth <= PHONE_MAX_WIDTH) return PHONE;
  if (viewportWidth <= TABLET_MAX_WIDTH) return TABLET;
  return DESKTOP;
}
