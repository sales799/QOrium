# Stack-Vault One-Pager Design Specification

**Status:** Complete
**Version:** 1.0
**Last Updated:** May 2, 2026
**Owner:** CTO Office (Sales Enablement)
**Use Case:** Printed A4 or PDF handout for GCC, enterprise discovery calls

---

## 1. Design Brief Overview

The Stack-Vault one-pager is a premium A4 collateral piece (210mm × 297mm) for delivery during or immediately after discovery calls with enterprise prospects (GCCs, IT services, large staffing firms). It serves as a leave-behind summary of QOrium's Stack-Vault offering and should reinforce the "premium, secure, India-built" positioning.

**Design tone:** Professional, technical-forward, minimalist.
**Color palette:** Navy primary, cyan accents, white space abundance.
**Typography:** Inter Display (headers), Inter (body), JetBrains Mono (data).
**Paper stock:** 300gsm matte or glossy.
**Finishing:** Optional embossed logo or gold foil on QOrium wordmark.

---

## 2. Layout Structure (A4 Portrait)

### Above the Fold (Top 120mm)

**Header Bar (navy background, full-bleed):**
- QOrium wordmark (white, 40mm height) positioned left with 12mm padding
- Tagline right-aligned: "The Source of Truth for Technical Assessment" (white, Inter 11pt)

**Hero Statement (white background, 60mm height):**
- **Main headline (48pt Inter Display, navy, bold):** "Stack-Vault: Enterprise-Grade Question Libraries"
- **Subheadline (18pt Inter, cyan):** "Exclusive, watermarked, anti-leak-rotated content for your hiring stack"
- **Hero graphic (right side, 40mm × 50mm):** Geometric illustration—three overlapping navy/cyan rectangles representing "security layers"

### Left Column (120mm wide, white background)

**Section 1: The Problem (25mm height)**
- **Headline (16pt Inter Display, navy):** "The Challenge"
- **Bullet points (11pt Inter, charcoal, line-height 1.5):**
  - Candidate fraud: Generic platforms leak questions; bad actors memorize
  - Content staleness: In-house authoring scales poorly; libraries grow stale
  - Hiring inconsistency: Your tech stacks evolve; assessments don't keep pace

**Section 2: Why QOrium (30mm height)**
- **Headline (16pt Inter Display, navy):** "Why Stack-Vault"
- **Three short paragraphs (11pt Inter, charcoal):**
  1. *Exclusive Libraries:* Custom questions aligned to your tech stacks (SAP, Salesforce, Oracle, Java, Cloud). Nobody else uses your content.
  2. *Watermarked & Tracked:* Every question is forensically watermarked. If one leaks, we prove which customer it came from.
  3. *Anti-Leak Rotation:* Quarterly refresh cycles. Critical leaks resolved in 24 hours. Your library stays ahead of the curve.

**Footer (white background, 12mm height):**
- Small disclaimer: "QOrium © 2026. All rights reserved." (8pt, slate gray)
- Contact: "bhaskar@qorium.online | +91-XXXX-XXXXXX" (10pt, navy, bold)

### Right Column (90mm wide, white background)

**Section 3: What You Get (45mm height)**
- **Headline (16pt Inter Display, navy):** "Your Stack-Vault Includes"

**Three-column layout (sub-columns, 28mm each):**

| **Column 1** | **Column 2** | **Column 3** |
|---|---|---|
| **Roles Curated** Exclusive questions for your top-priority roles (e.g., Senior Salesforce Developer, AWS Solutions Architect) | **Quarterly Refresh** Fresh question batches every quarter. Anti-leak detection identifies exposure; we pull & replace immediately. | **Forensic Watermarking** Every question encrypted with customer fingerprint. Leak traced back to source within 24 hours. |

(Use navy icons, 16mm × 16mm, above each column title. Example icons: "target" for Roles, "calendar" for Refresh, "shield" for Watermarking.)

**Section 4: Engagement Path (25mm height)**
- **Headline (16pt Inter Display, navy):** "How It Works"

**Three-step numbered list (11pt Inter, charcoal):**
1. **Discovery & Scoping (Week 1–2):** We learn your roles, stacks, hiring volume, and success metrics. Engineering team reviews sample pack (50 questions).
2. **Stack-Vault Delivery (Month 1–2):** First batch of exclusive questions delivered. Your team validates; we iterate on feedback. Watermarking & rotation systems activate.
3. **Ongoing Optimization (Month 3+):** Quarterly refresh cycles begin. Leak detection monitors; feedback loop refines. Expansion to new roles & geographies on your schedule.

**Section 5: Pricing (15mm height)**
- **Headline (14pt Inter Display, navy):** "Investment"
- **Pricing table (10pt JetBrains Mono, monospace alignment):**
  ```
  Department Tier    ₹10L/year   (₹8.3L/month)
  Enterprise Tier    ₹40L/year   (₹3.3L/month)
  ```
- **Note (9pt Inter italic, slate):** "Pricing is fixed-term (1-year minimum, 3-year preferred). Multi-role discounts available. Pilot success metrics reset timeline to full expansion."

**Section 6: Next Steps (12mm height)**
- **Headline (14pt Inter Display, navy):** "Let's Talk"
- **CTA button graphic (cyan background, navy text, 12pt bold):** "Schedule a 30-Minute Discovery Call"
- **QR code (right, 25mm × 25mm):** Links to Calendly booking for AE; encoded URL with campaign tag (e.g., `qorium.online/book?source=stack-vault-pager`)

---

## 3. Color & Typography Application

### Color Usage
- **Navy (#0A1F3D):** Headlines, section titles, QOrium wordmark
- **Cyan (#00B3C7):** Subheadings, accent bars, icon fills, CTA button text
- **Gold (#D4A85A):** Optional: foil stamp on logo or corner accent (premium finish)
- **Charcoal (#2C3E50):** Body text, secondary content
- **Slate (#64748B):** Fine print, metadata, timestamps
- **Fog (#E2E8F0):** Horizontal rule dividers between sections
- **Cloud (#F8FAFC):** Optional: background fill for "What You Get" section

### Typography Hierarchy
- **H1 (main headline):** 48pt Inter Display, navy, 110% leading
- **H2 (section headers):** 16pt Inter Display, navy, 120% leading
- **Body copy:** 11pt Inter, charcoal, 150% leading (1.5 line-height)
- **Callouts/labels:** 10pt Inter, 600 weight, navy
- **Code/data:** 10pt JetBrains Mono, slate
- **Fine print:** 8–9pt Inter, slate

---

## 4. Design Notes for Agency/Designer

### Layout Grid
Use a 3-column grid (70mm per column) with 10mm gutters. Left column and right column split at 120mm/90mm to accommodate content hierarchy: problem/why on left, solution/pricing/next steps on right.

### White Space
Maintain 12mm margins all sides. Aim for 40% white space (background) to avoid cluttered appearance. Section-to-section vertical spacing: 8mm minimum.

### Icons
Commissioning required. 16mm × 16mm, line-weight 1.5pt, navy or cyan fills. Needed:
- Target (roles)
- Calendar (refresh)
- Shield (watermarking)
- Arrow (workflow steps)
- QR icon placeholder

### QR Code
Generated dynamically by CMS/designer. Link target: `qorium.online/book?source=stack-vault-pager&date=[ISO]`. Ensure 25mm × 25mm minimum size; scan-test before print run.

### Printing Specs
- **Size:** A4 (210mm × 297mm)
- **Paper:** 300gsm matte or glossy, white
- **Finish:** Optional embossed logo or gold foil on QOrium mark
- **Bleeds:** 5mm full bleed on all sides (total 220mm × 307mm)
- **File format:** PDF/X-1a (CMYK, embedded fonts, no transparency)
- **Resolution:** 300 DPI minimum
- **Print run:** 500–1000 units for Month 3–6

---

## 5. Digital Variant (PDF)

A digital version (for email, web download) should:
- Match A4 dimensions (210mm × 307mm @ 96 DPI = 794px × 1,123px)
- Include interactive CTA (blue hyperlink on "Schedule..." button)
- Embed QR code linking to booking URL
- Save as PDF/Web-optimized (under 2MB, compressed images)
- Provide alt-text for images (e.g., "Three navy and cyan overlapping rectangles representing security layers")

---

## 6. One-Pager Versioning

Create one master template; generate variants for:
1. **Generic version:** Placeholder company names, generic role list, no logo/domain customization
2. **Bosch variant:** "Stack-Vault for Bosch GCC" + specific roles (Senior Salesforce Developer, SAP ABAP Engineer, etc.)
3. **Siemens variant:** "Stack-Vault for Siemens" + tailored tech stack
4. **Staffing firm variant:** "Stack-Vault for Hiring Firms" + staffing-relevant pain points

All variants reuse the same layout/color structure; only text changes.

---

## 7. Drafting Notes

### Note 1: Hero Graphic Development
The geometric illustration (three overlapping rectangles) is the visual anchor. Get 2–3 design directions from the brand agency. Must feel "secure" (fortress) and "technical" (clean lines) simultaneously. Consider subtle animation for PDF version (if platform supports; otherwise static).

### Note 2: Sample Pack Callout
Consider adding a small callout box (50mm × 40mm, light cyan background, navy border, 1pt) above or alongside the CTA with text: *"See a sample: 50 exclusive questions from your top role. Request with your discovery call."* This bridges the discovery-to-sample-pack journey.

### Note 3: Variant Customization Workflow
Once master template finishes design, provide the designer with a Figma file or Sketch library. Variants should be in the same file but on separate artboards. Allow for quick copy-paste text updates without touching layout/colors (reduces customization cost).

---

**End of Stack-Vault One-Pager Specification**
