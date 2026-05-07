/**
 * NSQF level — National Skills Qualifications Framework, defined by NSDC
 * (National Skill Development Corporation, India). Range 1–10, where:
 *   1–3   entry-level operative
 *   4–5   skilled / supervisory
 *   6     bachelor's-level / first-line technical lead
 *   7     bachelor's-degree-equivalent
 *   8     senior professional / specialist / first-line manager
 *   9     specialist (master's-equivalent)
 *   10    expert / strategic leadership (PhD-equivalent)
 *
 * QOrium's question banks are authored at "senior" depth; expect most
 * mappings in 6–9.
 */
export type NsqfLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * NOS — National Occupational Standard. Issued by India's Sector Skills
 * Councils (SSCs). Format: `SSC/N<4 digits>`. The leading SSC slug varies
 * by council:
 *   SSC   — IT-ITeS Sector Skills Council
 *   ASC   — Automotive Skills Council
 *   BFSI  — BFSI Sector Skills Council
 *   ESSCI — Electronics Sector Skills Council India
 *   THSC  — Tourism & Hospitality (not used by QOrium)
 */
export type SectorSlug = 'SSC' | 'ASC' | 'BFSI' | 'ESSCI';

export interface NosMapping {
  /** QOrium skill slug as it appears in `content.skills.id_slug`. */
  qoriumSkillId: string;
  /** Coarse-grained QOrium sub-skill, when the mapping is sub-skill-specific. */
  qoriumSubSkillId?: string;
  /** NSQF cognitive level. */
  nsqfLevel: NsqfLevel;
  /** Sector Skills Council slug. */
  sector: SectorSlug;
  /** NOS code, e.g. `SSC/N0501`. */
  nosCode: string;
  /** Human-readable NOS title (latest published version). */
  nosTitle: string;
  /** Verification status — `pending` items must NOT be used in regulatory
   *  filings until cross-checked against the live NSDC NQR registry. */
  verification: 'pending' | 'verified';
  /** Free-text note about provenance, ambiguity, or sub-skill scope. */
  notes?: string;
}

export interface NsqfLevelDescriptor {
  level: NsqfLevel;
  /** One-line process descriptor (action verbs that level encompasses). */
  process: string;
  /** Knowledge type and depth descriptor. */
  knowledge: string;
  /** Responsibility scope. */
  responsibility: string;
}
