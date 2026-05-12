# NSDC NOS Mapping — v0.1 (draft)

**File:** `governance/nsdc-mapping.csv`
**Authored:** 2026-05-12, autonomous Run #33
**Status:** v0.1 pilot — `confidence:draft` on every IT-ITeS row; `confidence:tbd-research-needed` on BFSI + Auto + GenAI rows. Not yet ratified by SME Content Lead or NSDC sector SSC liaison.

## Purpose

Map QOrium's 13 sub-skill clusters (per `governance/hiring/sme-content-lead/JD.md`) to NSDC National Occupational Standards (NOS) codes. NOS-tagged items become eligible for NSDC vocational certification reporting and NQF-level reporting, which is a defensible moat in India-stack hiring conversations (Bosch GCC, TCS, Infosys, Wipro, etc.).

## What's in v0.1

- **13 rows** for QOrium's 13 sub-skill clusters across 3 groups (tech-core, india-stack, psychometric-wave-3) + 3 cross-cutting rows
- **NOS codes** populated where I'm reasonably confident from the IT-ITeS SSC NASSCOM published catalogue (SSC/N0501, N0503, N0701, N0901, N9001, N9003)
- **TBD** marked explicitly where the NOS code requires verification against the BFSI SSC, Automotive Skills Development Council (ASDC), or where no NOS yet exists (AIPE/GenAI)

## What's NOT in v0.1

- Exact NOS codes for Finacle/Flexcube (BFSI SSC), Embedded Automotive (ASDC) — flagged `tbd-research-needed`
- Psychometric items — explicitly N/A because NSDC NOS doesn't certify psychometric assessment; track APA Div-14 / SIOP standards instead
- AIPE — no published GenAI-coding NOS as of 2026-05; QOrium to propose to NSDC v10 catalogue
- Per-item tagging — this is cluster-level, not item-level

## Next steps (post-CEO ratification)

1. SME Content Lead (when hired) validates every row
2. Engage NSDC IT-ITeS SSC liaison for AIPE NOS advocacy
3. Engage BFSI SSC for Finacle/Flexcube exact codes
4. Engage ASDC for Embedded Automotive exact codes
5. Per-item tagging UI in admin console (Sprint 1.8+)
6. Pricing-page differentiation: "Q-codes that map to NSDC NOS" as an India-stack moat

## Source signals used

- Public NSDC IT-ITeS SSC NASSCOM QP+NOS catalogue (v9, latest)
- `governance/hiring/sme-content-lead/JD.md` for the 13 sub-skill list
- Live DB `content.questions` skill schema (see also `content.skills` + `content.sub_skills`, both currently empty in production)

## Confidence legend

- `draft` — mapped from IT-ITeS SSC NASSCOM published QP+NOS catalogue with reasonable confidence; SME Content Lead to re-validate at hire
- `tbd-research-needed` — needs liaison engagement with the relevant sector SSC
- `tbd` — needs NSDC catalogue v10 advocacy (AIPE)
- `n/a` — explicitly out of NSDC NOS scope (psychometric)
