// N7 — skill consolidation. Canonical skill-family taxonomy + reversible mapping.
//
// The live bank fragments ~1,400 released questions across 500+ micro-skills
// (e.g. "Sql", "Senior Sql", "PostgreSQL" are all really one family; "AWS" alone
// is spread across dozens of micro-rows). This module is the single source of
// truth that collapses any micro-skill NAME into one of a small, stable set of
// buyer-facing families.
//
// It is pure and side-effect-free: no DB and no migration is required for it to
// function. A later N7 slice persists a reversible `content.skill_families`
// mapping (numbered per RESERVED.md, staging-applied); until then families are
// computed in-app from this taxonomy, which keeps the change additive and safe.

export type SkillFamilyId =
  | 'enterprise-erp'
  | 'cloud-devops'
  | 'data-science-ml'
  | 'data-databases'
  | 'mobile'
  | 'frontend'
  | 'backend'
  | 'qa-testing'
  | 'security'
  | 'systems-networking'
  | 'project-product'
  | 'programming-fundamentals'
  | 'other';

export interface SkillFamily {
  id: SkillFamilyId;
  name: string;
  // Matched in array order; the first family with a matching pattern wins.
  patterns: RegExp[];
}

// Order matters — more specific / higher-priority families are listed first.
// `other` is the terminal fallback and has no patterns.
export const SKILL_FAMILIES: SkillFamily[] = [
  {
    id: 'enterprise-erp',
    name: 'Enterprise & ERP',
    patterns: [
      /\bsap\b/,
      /\babap\b/,
      /salesforce/,
      /servicenow/,
      /workday/,
      /sailpoint/,
      /dynamics/,
      /netsuite/,
      /peoplesoft/,
      /sharepoint/,
      /oracle\s*(apps|ebs|fusion|hcm)/,
    ],
  },
  {
    id: 'cloud-devops',
    name: 'Cloud & DevOps',
    patterns: [
      /\baws\b/,
      /amazon web/,
      /azure/,
      /\bgcp\b/,
      /google cloud/,
      /kubernetes|k8s/,
      /docker/,
      /terraform/,
      /ansible/,
      /jenkins/,
      /ci\/?cd/,
      /devops/,
      /\bcloud\b/,
      /\bhelm\b/,
      /openshift/,
      /prometheus|grafana/,
    ],
  },
  {
    id: 'data-science-ml',
    name: 'Data Science, ML & AI',
    patterns: [
      /machine learning|\bml\b/,
      /deep learning/,
      /\bai\b|artificial intel/,
      /\bnlp\b|natural language/,
      /data scien/,
      /tensorflow|pytorch|keras|scikit/,
      /\bllm\b|generative ai/,
      /computer vision/,
      /pandas|numpy/,
    ],
  },
  {
    id: 'data-databases',
    name: 'Data & Databases',
    patterns: [
      /\bsql\b/,
      /nosql/,
      /postgres/,
      /mysql/,
      /mongo/,
      /\boracle\b/,
      /cassandra/,
      /\bredis\b/,
      /snowflake|databricks/,
      /\betl\b/,
      /data engineer/,
      /power\s*bi|tableau/,
      /spark|hadoop|kafka/,
      /database|\bdba\b/,
      /elasticsearch/,
    ],
  },
  {
    id: 'mobile',
    name: 'Mobile',
    patterns: [
      /android/,
      /\bios\b/,
      /swift/,
      /kotlin/,
      /react native/,
      /flutter/,
      /xamarin/,
      /objective-?c/,
      /\bmobile\b/,
    ],
  },
  {
    id: 'frontend',
    name: 'Frontend',
    patterns: [
      /react(?!\s*native)/,
      /angular/,
      /\bvue\b/,
      /svelte/,
      /javascript/,
      /typescript/,
      /\bhtml\b/,
      /\bcss\b|sass|scss|tailwind/,
      /next\.?js/,
      /redux/,
      /frontend|front-end/,
      /jquery/,
      /webpack/,
    ],
  },
  {
    id: 'backend',
    name: 'Backend',
    patterns: [
      /\bjava\b/,
      /spring/,
      /node\.?js|\bnode\b|express/,
      /\.net|dotnet|c#|csharp/,
      /c\+\+|\bcpp\b/,
      /\bgo\b|golang/,
      /\bphp\b|laravel|symfony/,
      /\bruby\b|rails/,
      /python/,
      /\bapi\b|\brest\b|graphql|grpc/,
      /microservice/,
      /backend|back-end|server-?side/,
      /\bscala\b/,
      /\brust\b/,
    ],
  },
  {
    id: 'qa-testing',
    name: 'QA & Testing',
    patterns: [
      /selenium/,
      /\bqa\b/,
      /\btest(ing|er|s)?\b/,
      /cypress|playwright|appium/,
      /junit|testng|pytest|jest/,
      /quality assur/,
      /\bsdet\b/,
    ],
  },
  {
    id: 'security',
    name: 'Security',
    patterns: [
      /security|infosec/,
      /cyber/,
      /penetration|pentest/,
      /\bsiem\b/,
      /vulnerab/,
      /cryptograph/,
      /firewall/,
    ],
  },
  {
    id: 'systems-networking',
    name: 'Systems & Networking',
    patterns: [
      /linux|unix/,
      /network/,
      /\btcp\b|\budp\b|\bdns\b/,
      /\bcisco\b|ccna/,
      /sysadmin|system admin/,
      /windows server/,
      /shell scripting|\bbash\b/,
      /vmware/,
    ],
  },
  {
    id: 'project-product',
    name: 'Project & Product',
    patterns: [
      /agile|scrum|kanban/,
      /project manage|\bpmp\b/,
      /product manage/,
      /business analy/,
      /\bjira\b/,
      /\bsdlc\b/,
      /stakeholder/,
    ],
  },
  {
    id: 'programming-fundamentals',
    name: 'Programming Fundamentals',
    patterns: [
      /algorithm|data structure|\bdsa\b/,
      /\boop\b|object-?oriented/,
      /design pattern/,
      /programming|coding/,
      /software (engineer|develop)/,
      /problem solving/,
    ],
  },
  { id: 'other', name: 'Other', patterns: [] },
];

const FAMILY_BY_ID: Record<SkillFamilyId, SkillFamily> = Object.fromEntries(
  SKILL_FAMILIES.map((f) => [f.id, f]),
) as Record<SkillFamilyId, SkillFamily>;

/**
 * Collapse a raw micro-skill name into its canonical family id. Deterministic and
 * reversible at the family level: the same name always maps to the same family,
 * and unmatched names fall back to `other` rather than being dropped.
 */
export function familyForSkill(skillName: string): SkillFamilyId {
  const n = (skillName || '').toLowerCase();
  for (const fam of SKILL_FAMILIES) {
    if (fam.id === 'other') continue;
    if (fam.patterns.some((p) => p.test(n))) return fam.id;
  }
  return 'other';
}

export function familyName(id: SkillFamilyId): string {
  return FAMILY_BY_ID[id]?.name ?? 'Other';
}

/**
 * Canonical seed for the persisted `content.skill_families` reference table
 * (migration 0022). Derived from SKILL_FAMILIES so the in-app taxonomy stays the
 * single source of truth; the migration mirrors these exact rows.
 * __tests__/skill-families-seed.test.ts fails CI if the two drift apart.
 */
export interface SkillFamilySeedRow {
  id: SkillFamilyId;
  name: string;
  sortOrder: number;
}

export const SKILL_FAMILY_SEED: SkillFamilySeedRow[] = SKILL_FAMILIES.map((fam, i) => ({
  id: fam.id,
  name: fam.name,
  sortOrder: i,
}));
