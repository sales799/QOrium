# QOrium — Brand & Design Tokens (locked v1)

Locked by Cowork CTO authority on the autonomous overnight build (2026-05-04). Override these by editing this file + `globals.css` together; never edit one without the other.

## Voice

- Sentences ≤ 22 words.
- No buzzword stacks ("AI-powered, scalable, enterprise-grade…"). Replace with concrete claims with numbers.
- Numbers always specific or omitted. "12M+ items", not "millions".
- Avoid "we" in headlines; use "you" or imperative.
- Pricing strings are **ranges**, never single SKUs.
- Banned in copy: lorem ipsum, "revolutionize", "synergy", "best-in-class", emoji.

## Locked clauses

**USP (Constitution §1.1, do not paraphrase):**

> QOrium is the world's first enterprise-grade Question-Bank-as-a-Service. We deliver an IRT-calibrated, anti-leak-rotated, watermark-per-candidate library — across general tech, India-stack, and AI-era assessment formats — to assessment platforms (API), enterprise hiring teams (Stack-Vault), and recruiters (subscription).

**Tagline (working):** "The world's question bank for hiring."

## Colors (HSL, registered in `@theme` at `src/app/globals.css`)

| Token                          | Light                                                       | Dark              | Use                                         |
| ------------------------------ | ----------------------------------------------------------- | ----------------- | ------------------------------------------- |
| `--color-ink`                  | `hsl(222 47% 6%)`                                           | `hsl(222 47% 6%)` | True-black surface for hero / dark sections |
| `--color-paper`                | `hsl(0 0% 100%)`                                            | `hsl(222 47% 6%)` | Body background                             |
| `--color-graphite-{50..900}`   | cool slate ramp                                             | cool slate ramp   | Borders, muted text, surface elevation      |
| `--color-signal-{300,500,700}` | `hsl(192 90% 70%)`, `hsl(192 95% 50%)`, `hsl(192 100% 32%)` | same              | Single accent — CTAs, highlights, KPIs      |
| `--color-positive`             | `hsl(152 60% 45%)`                                          | same              | Success, "fresh question" indicators        |
| `--color-warning`              | `hsl(38 92% 52%)`                                           | same              | Anti-leak warning, expiry                   |
| `--color-danger`               | `hsl(0 72% 55%)`                                            | same              | Errors, leak alerts                         |

Banned in design: purple-on-white gradients, pastel SaaS palettes, generic "AI rainbow" gradients.

## Typography (loaded via `next/font/google` in `src/app/layout.tsx`)

| Family             | Use                                 |
| ------------------ | ----------------------------------- |
| **Geist Sans**     | Display + UI                        |
| **Geist Mono**     | Prices, code, KPI numerals          |
| **Source Serif 4** | Long-read serif (legal + blog body) |

Banned: Inter, Roboto, Arial, system defaults.

## Type scale

```
--text-display-1: clamp(3.5rem, 5vw + 1rem, 5.5rem); line-height: 1.04; letter-spacing: -0.025em
--text-display-2: clamp(2.5rem, 3vw + 1rem, 3.75rem); line-height: 1.06
--text-h1: 2.25rem; --text-h2: 1.75rem; --text-h3: 1.375rem
Body: 1rem / 1.6  ·  Long-read serif: 1.125rem / 1.7
```

## Motion

- Default reveal: fade-up 12px, 400ms, `--ease-out-quart`.
- Wrap every animation in `useReducedMotion()`. No parallax on mobile.
- One Aceternity heavy effect per fold. Never two stacked.
- No animation on `(legal)` route group.

## Photography / illustration policy

- ZERO stock photos.
- Visuals = (a) abstract geometric / data-vis SVG, (b) one R3F scene maximum (home hero), (c) HTML-rendered admin UI / API response mockups.

## Component governance

| Reach for            | When                                                    |
| -------------------- | ------------------------------------------------------- |
| **shadcn/ui**        | Interactive primitives needing a11y + Radix internals   |
| **Aceternity**       | Full-bleed background or canvas effect (max 2 per page) |
| **Magic UI**         | Small focused micro-animations                          |
| **Custom Motion 12** | Page-specific scroll sequences, consistent reveals      |
| **R3F**              | Home hero only                                          |
