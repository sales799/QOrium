import type { NosMapping } from './types.js';

/**
 * QOrium skill ↔ NOS code mappings (v0).
 *
 * STATUS: every entry below is `verification: 'pending'`. The codes are
 * **structurally correct** (SSC/N#### format, NSQF levels per
 * Anderson-Krathwohl + senior-level rubric) and reflect the public NSDC
 * NQR (National Qualifications Register) IT-ITeS, BFSI, ESSCI, and ASC
 * occupational standards. They MUST be cross-checked against the live
 * NSDC NQR before use in:
 *   - regulatory filings,
 *   - government tenders,
 *   - NSDC partnership claims,
 *   - investor due diligence.
 *
 * Verification path: NSDC public NQR API + IP counsel sign-off (CC-02-A).
 * Once verified, flip `verification: 'verified'` and add a `verifiedOn`
 * field via a separate migration / data-update PR.
 *
 * The framework (this package) does not change with verification — only
 * the data does. So the package can ship and integrate today; mapping
 * data is upgradable later.
 */
export const NOS_MAPPINGS: ReadonlyArray<NosMapping> = [
  // ───────── Wave-1 Tech Core ─────────
  {
    qoriumSkillId: 'senior-java',
    nsqfLevel: 7,
    sector: 'SSC',
    nosCode: 'SSC/N0508',
    nosTitle: 'Software Developer (Senior)',
    verification: 'pending',
    notes: 'Maps QOrium Senior Java to IT-ITeS senior software developer NOS.',
  },
  {
    qoriumSkillId: 'senior-react',
    nsqfLevel: 7,
    sector: 'SSC',
    nosCode: 'SSC/N0508',
    nosTitle: 'Software Developer (Senior)',
    verification: 'pending',
    notes: 'Frontend / React shares the senior software developer NOS.',
  },
  {
    qoriumSkillId: 'senior-python',
    nsqfLevel: 7,
    sector: 'SSC',
    nosCode: 'SSC/N0508',
    nosTitle: 'Software Developer (Senior)',
    verification: 'pending',
  },
  {
    qoriumSkillId: 'senior-sql-data',
    nsqfLevel: 7,
    sector: 'SSC',
    nosCode: 'SSC/N0512',
    nosTitle: 'Database Engineer / Data Engineer',
    verification: 'pending',
  },
  {
    qoriumSkillId: 'senior-devops-sre',
    nsqfLevel: 8,
    sector: 'SSC',
    nosCode: 'SSC/N0903',
    nosTitle: 'DevOps / Site Reliability Engineer',
    verification: 'pending',
    notes: 'Senior SRE with on-call + incident-management responsibility maps to L8.',
  },
  {
    qoriumSkillId: 'senior-aws',
    nsqfLevel: 8,
    sector: 'SSC',
    nosCode: 'SSC/N0934',
    nosTitle: 'Cloud Solutions Engineer',
    verification: 'pending',
  },
  {
    qoriumSkillId: 'senior-salesforce',
    nsqfLevel: 7,
    sector: 'SSC',
    nosCode: 'SSC/N0508',
    nosTitle: 'Software Developer (Senior) — Salesforce platform',
    verification: 'pending',
  },
  {
    qoriumSkillId: 'senior-aipe',
    nsqfLevel: 8,
    sector: 'SSC',
    nosCode: 'SSC/N0937',
    nosTitle: 'AI / Prompt Engineer (Senior)',
    verification: 'pending',
    notes: 'AI Prompt Engineering is a 2024+ NOS; code may still be marked draft on NSDC NQR.',
  },

  // ───────── Wave-2 India Stack ─────────
  {
    qoriumSkillId: 'senior-sap-abap',
    nsqfLevel: 8,
    sector: 'SSC',
    nosCode: 'SSC/N0541',
    nosTitle: 'ERP Specialist (SAP)',
    verification: 'pending',
    notes: 'SAP ABAP senior maps to ERP specialist L8 given migration / S/4 scope.',
  },
  {
    qoriumSkillId: 'senior-oracle-hcm-cloud',
    nsqfLevel: 8,
    sector: 'SSC',
    nosCode: 'SSC/N0542',
    nosTitle: 'ERP Specialist (Oracle HCM Cloud)',
    verification: 'pending',
  },
  {
    qoriumSkillId: 'senior-salesforce-cpq',
    nsqfLevel: 7,
    sector: 'SSC',
    nosCode: 'SSC/N0508',
    nosTitle: 'Software Developer (Senior) — Salesforce CPQ specialism',
    verification: 'pending',
  },
  {
    qoriumSkillId: 'senior-finacle-flexcube',
    nsqfLevel: 8,
    sector: 'BFSI',
    nosCode: 'BSC/N1101',
    nosTitle: 'Core Banking Platform Engineer',
    verification: 'pending',
    notes: 'BFSI SSC code; cross-check against latest BFSI NQR.',
  },
  {
    qoriumSkillId: 'senior-embedded-automotive',
    nsqfLevel: 8,
    sector: 'ASC',
    nosCode: 'ASC/N1604',
    nosTitle: 'Embedded Software Engineer (Automotive)',
    verification: 'pending',
    notes: 'ASC = Automotive Skills Council; AUTOSAR / ISO 26262 scope.',
  },

  // ───────── Wave-3 Psychometric ─────────
  // Wave-3 maps to ROLES (cognitive ability, personality SJT, etc.) rather
  // than narrow technical NOS codes. NSDC has no published NOS for
  // psychometric assessment authoring yet (2026). Left intentionally absent
  // here; resolved at the role level by the Reference Panel governance
  // process (Constitutional Amendment v2.1).
] as const;
