# Talking Points — 12 Common Questions, Crisp Answers

Precise, defensible, ≤ 22-word sentences (per BRAND.md). Use as
quick-reference during the discovery call + technical follow-up.

---

## Q1 — "Tell me about QOrium in one sentence."

> QOrium ships IRT-calibrated, anti-leak-rotated, watermark-per-
> candidate technical assessments through three SKUs: ReadyBank
> API, JD-Forge, and Stack-Vault.

(≤ 22 words. Hits all 3 USP fragments per Standing Order #2.)

---

## Q2 — "Why should we trust your calibration?"

> Our IRT calibration uses 2PL/3PL Birnbaum + JMLE with mean-0/sd-1
> anchor. Reference Panel ≥ 200 respondents per cohort. I/O
> Psychologist contractor co-signs every release.

> Calibration code is in production at packages/irt; 18 unit tests;
> Mantel-Haenszel DIF detection per cohort cut.

> The methodology white paper publishes Q4; co-authored with our
> I/O Psych contractor for external review.

---

## Q3 — "How does the watermark actually work?"

> HMAC-SHA256 over baseSeed‖tenantId‖renderId, with per-tenant
> pepper. Visible footer (human-readable) + homoglyph stego
> (Latin↔Cyrillic, signature-bit-driven).

> Every rendered question is unique to the (tenant, candidate,
> render-event). Exfiltration of a single question traces back to
> exactly one candidate session.

> 22 unit tests cover determinism, cross-tenant unforgeability,
> pepper rotation, and homoglyph round-trip.

---

## Q4 — "What stops candidates from copy-pasting questions to
ChatGPT during the assessment?"

> Three layers: (1) the watermark traces post-fact; (2) anti-leak
> service runs continuous public-source scanning; (3) for high-
> stakes assessments, candidates run via remote proctoring overlay
> (Y2 SKU integration).

> Today's primary defense is post-fact deterrence + watermark
> traceability + library rotation cadence. Live proctoring is on
> the Y2 roadmap.

---

## Q5 — "What about AI-generated cheating?"

> Two answers. First, AI-Plagiarism Benchmark Protocol (governance
> doc) detects LLM-generated lookalike submissions via embedding
> similarity + perplexity signals.

> Second, our items are calibrated for human discrimination, not
> LLM-difficulty. Items where ChatGPT scores high but our IRT
> shows low discrimination are auto-flagged for retirement.

> The combination — content + calibration — is the moat.

---

## Q6 — "What's your audit-trail story?"

> Every event in audit.events is hash-chained: SHA-256 over
> canonical JSON of (id, tenant_id, actor_id, event_type, payload,
> hash_previous). Tampering is detectable.

> Tenant-scoped via SCOPE_CLAUSE — Bosch sees only Bosch events.
> Bulk export to RFC-4180 CSV in < 60s for any 366-day window.

> SOC 2 Trust Services Criteria mapping doc available; CC1.1 →
> CC9.2 + A1, C1, PI1, P1 covered.

---

## Q7 — "Can you handle EU data residency?"

> Multi-region terraform skeleton (Sprint 5.0) is shipped: paired
> ap-south-1 + ap-southeast-1; future Frankfurt region scaffold
> ready.

> Apply gated on cred-drop. For Bosch's specific German parent
> data residency: that's a Y2 conversation, but the IaC is ready
> to extend.

---

## Q8 — "What does pricing look like?"

> Three SKUs. ReadyBank API: $5K-$25K per year range. JD-Forge:
> $49 to $499 per JD or pack. Stack-Vault Enterprise: ₹40L-₹1Cr+
> per year.

> Pricing is always quoted as ranges in pre-contract; firm number
> at contract signing. For Bosch's scale (10K engineers/year), Stack-
> Vault Enterprise is the relevant tier.

> Pilot is free.

---

## Q9 — "What about integrations with our existing stack?"

> ATS Connector Framework (Sprint 4.6) ships Lever stub today;
> Greenhouse and Workday adapters in Q3-Q4. Webhooks (Sprint 4.5)
> for real-time event flow.

> SAML/SSO + SCIM provisioning shipped (Sprint 3.3); Bosch's IdP
> integration is post-cred-drop.

> Audit Log API supports CSV/JSON export to any GRC tool.

---

## Q10 — "How is your team set up to support us?"

> CEO + CTO Office for the first 3 logos (white-glove). Senior
> Engineer #1 hire in flight (Q3). SME Content Lead hire in flight
> (Q3).

> I/O Psychologist contractor signed for methodology + calibration
> signoff. By Q4, full Y1 team is in place.

> Talpro India is our Customer-Zero; you'd be our second large
> reference.

---

## Q11 — "What happens if you fail / pivot / get acquired?"

> Three protections. (1) Per Constitution Article IX, no destructive
> migration on release-tagged schema; existing tenants migrate to
> read-only fork.

> (2) Stack-Vault customer data is isolated at schema level + per-
> tenant pepper; export-on-demand is a contractual right.

> (3) Acquisition transition: 12-month customer notice + data
> migration assistance is in our standard MSA.

---

## Q12 — "What's the one thing you wish other vendors did but
they don't?"

(Hard question; honest answer.)

> Range-quoted pricing in pre-contract. Most vendors quote a single
> number, then negotiate down — opaque + slow.

> We anchor on ranges from day one; firm number at contract. Our
> deal cycles are typically 30-50% shorter as a result.

> That's a process call as much as a product one. We've seen it
> work.

---

## Bonus — Q-13 — When pushed on a feature we don't have

> "Honest answer: we don't have [X] today. Here's the path: [Y is
> in our Q-Z roadmap]. If [X] is a hard requirement for Bosch, the
> right answer is to talk to me about co-engineering — Bosch's
> engineering team has the chops, and we can ship together if the
> commitment is there."

(Confidence + honesty + upside frame. Never bluff features.)

---

## Universal closing line

> "Bosch is a careful buyer. We're not asking for a leap of faith.
> We're asking for a 30-day pilot in one specific surface, with
> co-set success criteria and no charge. If the data confirms our
> projections, we move forward. If not, we close gracefully."

---

## Banned phrases in conversation

- "Revolutionize"
- "Synergy"
- "Best-in-class"
- "Game-changing"
- "Leverage" (as a verb)
- "Lorem ipsum" (joke; but seriously, never use placeholder
  language)
- Emoji
- "Trust me"
- "We can do anything"
- "We're better than [competitor]"

---

## Required phrases (per Standing Order #2)

At least one of these in every Bosch-facing conversation:
- "IRT-calibrated"
- "anti-leak-rotated"
- "watermark-per-candidate"

---

_Talking points are draft. CEO refines per actual call discovery
and Bosch's specific concerns._
