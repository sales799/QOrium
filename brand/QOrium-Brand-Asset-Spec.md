# QOrium Brand Asset Specification

**Status:** Complete
**Version:** 1.0
**Last Updated:** May 2, 2026
**Owner:** CTO Office (Brand Lead)

---

## Entity Attribution (REQUIRED on all QOrium-branded materials)

Every QOrium-branded asset (logo, website, deck, sales collateral, contract footer) must carry the entity attribution clause:

> "QOrium™ is a product of Talpro India Private Limited."

Visual placement options (designer's discretion):
- Footer micro-text on website (4pt-6pt; cool grey on background)
- "Powered by Talpro India Pvt Ltd" tagline under QOrium logo on enterprise pitch decks
- Trademark notice on contracts: "QOrium™ is a trademark of Talpro India Pvt Ltd."

Rationale: Talpro India Pvt Ltd is the only registered legal entity in the Talpro Universe portfolio (per Constitution v2.0 §1.0.1). All commercial agreements, employment, and IP filings are in Talpro India's name; QOrium is the product line / brand. The entity attribution prevents counterparty confusion + legal ambiguity.

Trademark status: "QOrium" + "ReadyBank" + "JD-Forge" + "Stack-Vault" filings (India + US Class 9, 42) in the name of Talpro India Pvt Ltd; pending counsel filing post-CC-02 closure.

---

## 1. Brand Essence Manifesto

**Headline:** QOrium is *the source of truth* for technical questions.

We are India-built, world-class. Our questions are IRT-calibrated, anti-leak-rotated, and forensically watermarked. We believe assessment platforms, enterprises, and staffing firms should never compromise on question quality. QOrium replaces guesswork with rigor.

**Core Values:**
- **Rigorous.** Every question meets IRT standards. No shortcuts.
- **Trustworthy.** Watermarking, leak detection, and transparent authorship build confidence.
- **Practical.** Questions reflect real-world technical scenarios, not trivia.
- **Global.** India-built; designed for enterprises and platforms worldwide.

---

## 2. Logo Brief

### Wordmark
- **Font:** Custom Inter Display (weight 700, geometric spacing)
- **Color:** Navy #0A1F3D (primary)
- **Sizing:** Minimum 80px wide for digital; 20mm for print
- **Lockup:** Always horizontal; never vertical unless explicit approval
- **Exclusion zone:** 1/4 wordmark width on all sides; no other elements intrude

### Logo Lockups

1. **Horizontal (primary):** QOrium wordmark + submark (if used: "The Source of Truth")
2. **Stacked (secondary):** QOrium over tagline; used in email signatures, narrow sidebars
3. **Monochrome:** Navy on white; reverse white on navy; grayscale for restricted backgrounds
4. **Icon only:** Standalone geometric mark (square with nested circle, representing "source" + "truth" duality); 1:1 aspect ratio

### Deliverables Checklist
- [ ] Master wordmark (AI, PDF, PNG @ 2x)
- [ ] Horizontal lockup (AI, PDF, PNG @ 2x)
- [ ] Stacked lockup (AI, PDF, PNG @ 2x)
- [ ] Icon/mark only (AI, SVG, PNG @ 2x, favicon @ 16px/32px)
- [ ] Monochrome variations (AI, PDF)
- [ ] One-color reverse (white on navy, navy on white)

---

## 3. Color Tokens

### Primary Palette
| Name | Hex | RGB | Use Case |
|---|---|---|---|
| **Navy** | #0A1F3D | 10, 31, 61 | Primary text, headers, logo |
| **Cyan** | #00B3C7 | 0, 179, 199 | CTAs, highlights, accents |
| **Gold** | #D4A85A | 212, 168, 90 | Secondary accents, premium tier signaling |

### Grayscale
| Name | Hex | Use |
|---|---|---|
| **Charcoal** | #2C3E50 | Body text |
| **Slate** | #64748B | Secondary text, disabled states |
| **Fog** | #E2E8F0 | Borders, dividers |
| **Cloud** | #F8FAFC | Background fill, cards |

### Semantic Colors
- **Success (Green):** #10B981 — Milestones hit, integrations live
- **Warning (Amber):** #F59E0B — Approaching SLA limits, refresh due
- **Error (Red):** #EF4444 — Leaks detected, auth failures
- **Info (Blue):** #3B82F6 — Announcements, API updates

---

## 4. Typography

### Display Font
- **Font Family:** Inter Display (or Inter SemiBold/Bold for fallback)
- **Weights used:** 600 (semibold), 700 (bold)
- **Use:** Page titles, section headers, hero text
- **Sizes:** 32px (H1), 28px (H2), 24px (H3) on web; scale by 1.33x for print

### Body Font
- **Font Family:** Inter
- **Weights:** 400 (regular), 500 (medium), 600 (semibold)
- **Use:** Body copy, labels, nav text
- **Sizes:** 16px (body), 14px (secondary), 12px (small) on web
- **Line Height:** 1.5 (body), 1.4 (labels)

### Code Font
- **Font Family:** JetBrains Mono
- **Weight:** 400
- **Use:** Code snippets, API examples, technical documentation
- **Size:** 13px; maintain monospace proportions
- **Background:** Light (#F1F5F9) with padding 8px

### Font Access
- **Hosted:** Google Fonts (Inter, JetBrains Mono) or self-hosted WOFF2
- **License:** OFL (Inter, JetBrains Mono) — no restrictions
- **Fallback stack:** Inter, -apple-system, BlinkMacSystemFont, sans-serif

---

## 5. Voice & Tone

### Voice Pillars
1. **Expert, not condescending.** We speak to engineers and hiring leaders as peers.
2. **Clear, not verbose.** No jargon unless necessary; explain technical concepts plainly.
3. **Confident, not arrogant.** We know our strengths; we don't oversell.

### Tone Variations

| Context | Tone | Example |
|---|---|---|
| Marketing website | Professional, aspirational | "QOrium is *the source of truth* for technical assessment." |
| API documentation | Precise, direct | "POST /questions/{id}/validate returns a 200 with the watermarked payload." |
| Customer email | Warm, supportive | "Your stack validates 50+ questions weekly—here's how we're tracking." |
| Error message | Helpful, non-alarming | "Rate limit approaching. You have 450 questions remaining this month." |

---

## 6. Imagery Direction

### Photography
- **Style:** Authentic, tech-forward, India-inclusive
- **Subjects:** Engineers at work, hiring leaders in meetings, diverse global team members
- **Mood:** Focused, confident, collaborative (not generic stock)
- **Color treatment:** Navy + cyan overlays or duotone; maintain brand consistency

### Iconography
- **System:** Custom icon set (24x24, 32x32, 48x48 grid)
- **Style:** Line-based, 2px stroke, consistent cap/join angles
- **Categories:** Workflow (auth, API, assessment), Status (live, pending, failed), Entity (user, question, platform, role)
- **Deliverable:** SVG library + Figma component set

### Illustrations
- **Use:** Onboarding, empty states, conceptual diagrams
- **Style:** Geometric, minimal, navy + cyan palette
- **Tools:** Figma or Blender; export as SVG + PNG

---

## 7. LinkedIn & Email Templates

### LinkedIn Banner
- **Dimensions:** 1200x627px
- **Content:** QOrium wordmark (left, navy), hero statement ("*The source of truth* for technical assessment"), navy + cyan color blocks
- **Variants:** LinkedIn company profile banner, individual post background

### Email Signature
```
[QOrium logo icon 32x32]
[Name]
[Title]
QOrium | The Source of Truth for Technical Assessment
bhaskar@qorium.online | +91-XXXX-XXXXXX
[Website link]
```

### Email Header
- **Background:** Navy #0A1F3D, full-width banner
- **Logo:** White QOrium wordmark, 48px high, left-aligned with 24px padding
- **Subheader text:** Cyan #00B3C7, 14px, medium weight (e.g., "Weekly Digest," "Security Alert")

---

## 8. Pitch Deck Visual Rules

### Master Slide Template
- **Aspect ratio:** 16:9
- **Master background:** Navy left margin (15% width), white right body
- **Title slide:** Full-bleed navy background, white QOrium wordmark (center), cyan accent bar (bottom)
- **Content slide:** Navy left nav bar (with slide number), white body, cyan accents for callouts

### Typography in Slides
- **Titles:** Inter Display, 40px, navy, top-left
- **Body:** Inter 18px, charcoal, left-aligned
- **Data:** JetBrains Mono 14px, slate, monospace
- **Callout/highlight:** Cyan background pill, 16px, semibold

### Chart & Graph Rules
- **Color order:** Navy (primary metric), cyan (secondary), gold (tertiary), then grays
- **Fonts:** Inter for labels, JetBrains Mono for values
- **Grid:** Light fog lines (#E2E8F0), no heavy borders

---

## 9. Web Design Rules

### Navigation
- **Header:** White background, navy text, cyan hover state
- **Logo placement:** Top-left, 32px height
- **Nav items:** 16px Inter, 600 weight, 24px spacing
- **Mobile:** Hamburger toggle at 768px breakpoint

### Hero Section
- **Background:** Gradient navy (#0A1F3D) to darker navy (linear, 180deg)
- **Headline:** 52px Inter Display, white, centered
- **Subheadline:** 24px Inter, cyan, centered below
- **CTA button:** Cyan #00B3C7 background, navy text, 16px, 12px padding, 4px border-radius

### Cards & Sections
- **Card background:** Cloud #F8FAFC
- **Card border:** 1px Fog #E2E8F0
- **Corner radius:** 8px (cards), 4px (inputs)
- **Shadow:** Subtle (0 2px 8px rgba(0,0,0,0.08))

### Typography Sizing
- **H1 (page title):** 48px Inter Display, navy
- **H2 (section title):** 36px Inter Display, navy
- **H3 (subsection):** 28px Inter Display, navy
- **Body text:** 16px Inter, charcoal, line-height 1.6
- **Small text (labels, metadata):** 12px Inter, slate

### Forms
- **Input border:** 1px Fog #E2E8F0
- **Input focus:** 2px cyan #00B3C7 outline
- **Label:** 14px Inter, 600 weight, charcoal, required indicated by red asterisk

### Responsive
- **Breakpoints:** 1200px (desktop), 768px (tablet), 375px (mobile)
- **Font scaling:** No smaller than 16px on mobile; maintain 1.5 line-height minimum
- **Spacing:** 16px grid on mobile, 24px on desktop

---

## 10. Drafting Notes

### Note 1: Logo Icon Development
The icon/mark (geometric square-circle) should feel "layered" and "secure"—visual metaphor for forensic watermarking. Consider nesting concentric circles to represent "source of truth" layers. Get 3 design directions from brand agency; refine with design lead before final file delivery.

### Note 2: Color Adoption Timeline
- **Week 1:** Adopt navy #0A1F3D and grayscale for all documentation (email, decks, GitHub)
- **Week 2:** Introduce cyan #00B3C7 accents in CTAs and highlights (web, decks)
- **Week 3:** Full-color adoption in marketing collateral and web
- **Week 4+:** Refine based on feedback; gold #D4A85A introduction deferred to post-launch if market testing shows diminishing returns

### Note 3: Asset Centralization
All brand assets (logos, colors, fonts, templates) live in a private Figma workspace or GitHub Assets folder. Grant access to: CEO, CTO, Design Lead, Sales Leads, Marketing (when hired). Version all files with dates; do not allow destructive edits to master files.

---

**End of Brand Asset Specification**
