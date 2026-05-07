# @qorium/nos-mapper

NSDC / NOS / NSQF competency mapper for QOrium.

Translates QOrium skill slugs ↔ India's National Skills Qualifications
Framework (NSQF levels 1–10) and Sector-Skills-Council National
Occupational Standards (NOS codes).

Built as **Sprint 1.7b** per `governance/Auto-Mode-Remote-Plan-v1.md` for
India-Stack regulatory + tender alignment (competitive defense vs
non-Indian-context entrants).

## Status

- **Framework:** v0 — production-ready
- **Mapping data:** v0 — every entry is `verification: 'pending'`. Codes
  are structurally correct (SSC/N#### format, plausible NSQF levels) but
  must be cross-checked against the live NSDC NQR (National
  Qualifications Register) before use in regulatory filings, government
  tenders, NSDC partnership claims, or investor due diligence.
- **Verification path:** NSDC public NQR API + IP counsel sign-off
  (CC-02-A on the CEO action surface).

## API

```ts
import {
  findBySkill,
  findByNosCode,
  findByNsqfLevel,
  findBySector,
  coverage,
  NSQF_LEVELS,
} from '@qorium/nos-mapper';

// Forward lookup: skill slug → NOS mapping
findBySkill('senior-java');
// → { qoriumSkillId: 'senior-java', nsqfLevel: 7, sector: 'SSC',
//      nosCode: 'SSC/N0508', nosTitle: 'Software Developer (Senior)',
//      verification: 'pending' }

// Reverse lookup: NOS code → all skills sharing it
findByNosCode('SSC/N0508');
// → [senior-java, senior-react, senior-python, senior-salesforce, …]

// Filter by NSQF level
findByNsqfLevel(8);

// Filter by Sector Skills Council
findBySector('BFSI');

// Coverage diagnostics for the admin console
coverage();
// → { totalMappings, verified, pending, bySector, byNsqfLevel }
```

## Sectors

| Slug    | Sector Skills Council                     | QOrium skills                                                                                     |
| ------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `SSC`   | IT-ITeS                                   | Java, React, Python, SQL, DevOps/SRE, AWS, Salesforce, AIPE, SAP ABAP, Oracle HCM, Salesforce CPQ |
| `BFSI`  | Banking, Financial Services and Insurance | Finacle/Flexcube                                                                                  |
| `ASC`   | Automotive                                | Embedded Automotive                                                                               |
| `ESSCI` | Electronics                               | (none mapped yet)                                                                                 |

## NSQF level guidance

| Level | QOrium "senior" mapping                                                       |
| ----- | ----------------------------------------------------------------------------- |
| 1–5   | Below QOrium's question-bank depth                                            |
| 6     | First-line technical lead (rare in Wave-1)                                    |
| 7     | Bachelor's-equivalent senior IC (most Wave-1 software roles)                  |
| 8     | Senior specialist + decision-making in complex systems (DevOps/SRE, AWS, ERP) |
| 9     | Master's-level specialist (rare)                                              |
| 10    | Strategic / PhD-equivalent (out of scope)                                     |

## When to update mappings

- New skill added to `content.skills` → add a row to `src/mappings.ts`
- NSDC publishes a revised NOS code → update `nosCode` and `nosTitle`
- IP counsel confirms a mapping → flip `verification: 'verified'` and
  add a `verifiedOn` field
