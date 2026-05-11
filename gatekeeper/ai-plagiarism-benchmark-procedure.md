# AI Plagiarism Public Benchmark Procedure

**Authority:** Constitution SO-22 (AI Plagiarism Public Benchmark + 24h Anti-Leak SLA) + Article VII (Quality Gate auto-fail if missing)
**Source-of-truth protocol:** `governance/AI-Plagiarism-Benchmark-Protocol-v1.md`
**Owner:** GATEKEEPER (operates) + CDO (calibration data input)
**Cadence:** Quarterly (target: Q3 2026 first run on 2026-08-05 alongside Bali competitive scan)

---

## Why a public benchmark

Constitution SO-22 second clause: "AI Plagiarism Public Benchmark." The discipline is that QOrium's daily anti-leak rotation claim doesn't stay a marketing line — it gets measured, publicly, every quarter, against industry tools.

The public part is critical:

- A private benchmark we run privately is theatre
- A public benchmark we publish is accountability
- Customers (and competitors) can audit the claim

The Article VII auto-fail criterion makes it constitutional: skipping a quarterly benchmark fails the Quality Gate for any wave or release shipped in the period.

---

## What gets benchmarked

A 100-question random sample from the live library. Stratification:

- 60 questions from ReadyBank (shared library)
- 30 questions from JD-Forge output (last quarter's)
- 10 questions from Stack-Vault (anonymized — customer name removed; question content preserved)

Sampling is genuinely random per quarter (use a deterministic seed from the quarter's date for reproducibility, but seed varies per quarter).

---

## What tools the benchmark runs against

| Tool                                                 | What it tests                                                                    | Free/paid                               |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------- |
| **GPTZero**                                          | AI-generation detection — was this content GPT-generated?                        | Free tier sufficient for 100 questions  |
| **Originality.ai**                                   | Plagiarism + AI-detection combined                                               | Paid (~$20/quarter; budget acceptable)  |
| **Adaface published anti-leak SLA endpoint**         | Direct competitive benchmark — does Adaface's tool detect our content as leaked? | Per their API documentation; access TBD |
| **Manual Reddit + Glassdoor + GeeksforGeeks search** | The same surface scan our `cdo/anti-leak-forensics.md` engine runs continuously  | Manual (free)                           |
| **Custom QOrium fingerprint scan**                   | Runs our own anti-leak fingerprinting against the sample (control test)          | Internal                                |

The benchmark is INTENTIONALLY TOUGH on us: we run external tools that may flag QOrium content even when our own engine doesn't. Failing modes are interesting findings, not problems.

---

## Procedure (per quarter, ~4 hours)

### Step 1 — Sample selection (~30 min)

CDO + GATEKEEPER joint:

1. Determine the quarter date + seed
2. Random sample 100 questions per the stratification above
3. Document the sample list to `gatekeeper/benchmarks/YYYY-Qn-sample.md` (commit AFTER the benchmark completes; don't tip our hand)

### Step 2 — Run external tools (~2 hours)

For each tool above, submit the 100 questions and capture results.

For tools with API limits, batch over multiple sessions.

For Adaface direct test (if access available), this is the most important — it's the published competitor benchmark.

### Step 3 — Analyze results (~30 min)

For each tool, compute:

- **Detection rate:** % of questions flagged as AI-generated / leaked / plagiarized
- **False-positive rate:** % flagged but the content is genuinely original (we can confirm by reverse-search; QOrium-authored questions should score 0% positive)
- **False-negative rate:** % NOT flagged but the content IS old (sometimes we want our own detection to catch what external tools miss)

### Step 4 — Document findings (~30 min)

Save to `gatekeeper/benchmarks/YYYY-Qn-results.md`:

```markdown
# AI Plagiarism Public Benchmark — Q<n> <YYYY>

**Run date:** YYYY-MM-DD
**Sample seed:** <quarter-deterministic seed>
**Sample composition:** 60 ReadyBank · 30 JD-Forge · 10 Stack-Vault (anonymized)
**Operator:** GATEKEEPER + CDO

## Tool results

### GPTZero

- Detection rate: <%> (X / 100 flagged as AI-generated)
- False-positive rate: <% — i.e., flagged QOrium-original questions; should approach 0%>
- Notes: <observations>

### Originality.ai

- (same structure)

### Adaface anti-leak endpoint

- (same structure; THIS is the headline competitive benchmark)

### Manual surface scan

- (Reddit + Glassdoor + GeeksforGeeks; manual count of any sample question found on public surface)

### Custom QOrium fingerprint scan

- (Our own engine's detection rate on the same sample; should approach 0% — questions in our library shouldn't fingerprint-match public sources, by construction)

## Headline findings

<3-5 bullet points summarizing what the benchmark teaches us>

## Constitutional check

- SO-22 anti-leak SLA <24h: PASS / FAIL (evidence: when did the most recent leak get detected → retired? Window check)
- SO-22 quarterly benchmark run: PASS (this run)
- AI plagiarism public benchmark <industry-typical: PASS / FAIL (compared against published Adaface or industry tools)

## Public publishing plan

- Blog post draft: `apps/marketing/src/content/blog/YYYY-Qn-anti-leak-benchmark.mdx`
- Publish target date: YYYY-MM-DD (within 14 days of run completion)
- Customer-facing summary: included in next monthly business review
```

---

## Public publishing

The "public" in "AI Plagiarism Public Benchmark" means the results land on `qorium.online/blog`. Within 14 days of run completion:

1. Author a blog post summarizing the benchmark results
2. Embed in `apps/marketing/src/content/blog/`
3. Post to LinkedIn + Twitter (per `governance/launch/` cadence)
4. Update `qorium.online/security` if the benchmark surfaces a new claim worth making

If the benchmark goes BADLY (we flunk relative to industry):

- Publish anyway. Constitutional discipline > marketing comfort.
- The blog post becomes "what we learned + what we're fixing"
- Add the failure to `cto/tech-debt.md` with severity High
- Re-run benchmark in 30 days (off-cadence) after fixes; publish that result

---

## Anti-patterns

- ❌ **Cherry-picking the sample to look good.** Random seed disclosed in the report ensures reproducibility.
- ❌ **Running the benchmark privately and not publishing.** SO-22 says PUBLIC. Skipping publication = Constitutional violation.
- ❌ **Skipping the benchmark "because we're sure we'll pass."** SO-22 is quarterly-mandated; confidence isn't an excuse.
- ❌ **Marking results as "internal-only" if they're bad.** Transparency on bad results is the value; hiding them defeats the protocol.

---

## Q3 2026 first run — preparation

The first formal run is targeted for **2026-08-05** (alongside Bali quarterly competitive scan per SO-25, and quarterly secret rotation per `cto/runbooks/secret-rotation.md`).

Preparation needed:

- [ ] Confirm Originality.ai paid account exists (or budget approved for ~$20)
- [ ] Identify if Adaface anti-leak endpoint has public/partner access (else, document the gap and move on)
- [ ] Sample script ready (deterministic seed; pulls 100 questions per stratification)
- [ ] Blog post template ready in `apps/marketing/src/content/blog/`
- [ ] Calendar reminder set for 2026-08-05

Tracking pre-run preparation as a sub-item in `cto/tech-debt.md` adjacent to TD-003.

---

## Y1 reality

The first benchmark run hasn't happened yet (target Q3 2026). Until then:

- The constitutional discipline pre-ships in this document
- The protocol skeleton (`governance/AI-Plagiarism-Benchmark-Protocol-v1.md`) provides the legal framework
- This procedure provides the operational pathway
- Post-Q3 2026, append findings here per the structure above

---

_Cross-references: Constitution SO-22, Article VII (auto-fail), §2.6 (GATEKEEPER), §2.5 (CDO — provides sample data). Source-of-truth: `governance/AI-Plagiarism-Benchmark-Protocol-v1.md`. Companion docs: `cdo/anti-leak-forensics.md` (the engine the benchmark validates), `gatekeeper/quality-gate-operationalization.md` (auto-fail criterion #3 = this procedure run on time)._
