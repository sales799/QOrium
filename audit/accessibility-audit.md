# Accessibility Audit

Generated: 2026-06-18

## Status

The codebase already had a good baseline: skip link, visible global focus styles, Playwright route smoke tests, and a marketing-quality workflow that runs axe-core against critical routes.

## Findings

- Motion-heavy components use Motion's `useReducedMotion` in `Reveal`, `FadeIn`, and `Stagger`.
- Global CSS already disables animation and transition duration for `prefers-reduced-motion: reduce`.
- The decorative canvas grid still ran a requestAnimationFrame loop and was not explicitly hidden from assistive technology.

## Fixes Implemented

- `FlickeringGrid` now respects `prefers-reduced-motion: reduce` and draws a static frame instead of continuously flickering.
- `FlickeringGrid` is marked `aria-hidden` because it is decorative.
- Form submit and CTA tracking use data attributes, avoiding extra visible text or inaccessible controls.
- Metadata/legal tests now protect the safer legal notice.

## Verification

- Focused Vitest pass: 18 files, 115 tests.
- TypeScript pass for `@qorium/marketing`.

## Remaining Work

- Run full Playwright smoke after production build.
- Run axe-core in CI or locally against the final built app.
- Add a keyboard-only manual pass for the Calendly embed path because the widget is third-party.
