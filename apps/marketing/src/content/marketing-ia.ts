import { evidenceFlags, type EvidenceFlag } from '@/content/evidence-flags';

export type { EvidenceFlag } from '@/content/evidence-flags';

export type MenuIcon =
  | 'api'
  | 'authoring'
  | 'bank'
  | 'benchmarks'
  | 'book'
  | 'building'
  | 'code'
  | 'compare'
  | 'data'
  | 'docs'
  | 'forge'
  | 'globe'
  | 'graph'
  | 'india'
  | 'leak'
  | 'lock'
  | 'method'
  | 'platform'
  | 'pricing'
  | 'shield'
  | 'staffing'
  | 'vault'
  | 'watermark';

export interface NavLink {
  label: string;
  href: string;
  description?: string;
  icon?: MenuIcon;
  flag?: EvidenceFlag;
  external?: boolean;
}

export interface MegaMenuColumn {
  heading: string;
  links: NavLink[];
}

export interface MegaMenuPromo {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: MenuIcon;
  flag?: EvidenceFlag;
}

export interface MegaMenuPanel {
  label: string;
  href: string;
  columns: MegaMenuColumn[];
  promo: MegaMenuPromo;
}

export const megaMenuPanels: MegaMenuPanel[] = [
  {
    label: 'Platform',
    href: '/platform',
    columns: [
      {
        heading: 'Products',
        links: [
          {
            label: 'ReadyBank',
            href: '/platform/readybank',
            description: 'Calibrated skill-wise library with role and difficulty mapping.',
            icon: 'bank',
          },
          {
            label: 'JD-Forge',
            href: '/platform/jd-forge',
            description: 'Paste a job description and receive a structured assessment plan.',
            icon: 'forge',
          },
          {
            label: 'Stack-Vault',
            href: '/platform/stack-vault',
            description: 'Customer-exclusive, watermarked libraries for enterprise roles.',
            icon: 'vault',
          },
        ],
      },
      {
        heading: 'The Engine',
        links: [
          {
            label: 'Anti-Leak Rotation',
            href: '/anti-leak',
            description: 'Scan, retire, regenerate, and revalidate exposed questions.',
            icon: 'leak',
          },
          {
            label: 'IRT Calibration',
            href: '/science',
            description: 'Difficulty and discrimination signals for defensible scoring.',
            icon: 'data',
          },
          {
            label: 'Watermark-per-Candidate',
            href: '/anti-leak#watermarking',
            description: 'Forensic markers that make leakage attributable.',
            icon: 'watermark',
          },
          {
            label: 'Role-Graph',
            href: '/method#role-graph',
            description: 'Role, skill, stack, difficulty, and format taxonomy.',
            icon: 'graph',
          },
        ],
      },
      {
        heading: 'Delivery',
        links: [
          {
            label: 'REST API',
            href: '/resources/docs',
            description: 'Programmatic access for assessment platforms.',
            icon: 'api',
          },
          {
            label: 'Bulk Export',
            href: '/product/api#exports',
            description: 'CSV and JSON delivery for existing workflows.',
            icon: 'docs',
          },
          {
            label: 'Embedded Widget',
            href: '/product#embedded',
            description: 'Drop-in assessment surfaces for partner flows.',
            icon: 'code',
          },
          {
            label: 'White-Label',
            href: '/solutions/assessment-platforms',
            description: 'Private delivery for platform and enterprise teams.',
            icon: 'lock',
          },
        ],
      },
    ],
    promo: {
      eyebrow: 'Featured',
      title: 'The Assessment Library',
      description:
        'Browse seeded skill pages with transparent calibration status and role mapping.',
      href: '/library',
      cta: 'Explore library',
      icon: 'book',
    },
  },
  {
    label: 'Solutions',
    href: '/solutions/assessment-platforms',
    columns: [
      {
        heading: 'By Buyer',
        links: [
          {
            label: 'Assessment Platforms',
            href: '/solutions/assessment-platforms',
            description: 'License content through API and export workflows.',
            icon: 'platform',
          },
          {
            label: 'Enterprises & GCCs',
            href: '/solutions/enterprises-gcc',
            description: 'Stack depth, DPDP posture, and exclusive vaults.',
            icon: 'building',
          },
          {
            label: 'IT Staffing Firms',
            href: '/solutions/staffing-firms',
            description: 'ReadyBank plus JD-Forge for high-volume hiring.',
            icon: 'staffing',
          },
          {
            label: 'Mid-market Hiring Teams',
            href: '/solutions/staffing-firms#mid-market',
            description: 'Per-JD assessment packs without content operations overhead.',
            icon: 'pricing',
          },
        ],
      },
      {
        heading: 'By Role Hired',
        links: [
          {
            label: 'Software Engineering',
            href: '/solutions/role/software',
            description: 'Frontend, backend, full-stack, QA, and architecture tracks.',
            icon: 'code',
          },
          {
            label: 'Data / ML / Analytics',
            href: '/solutions/role/data',
            description: 'SQL, BI, data engineering, ML, and AI-era evaluation.',
            icon: 'data',
          },
          {
            label: 'DevOps / SRE / Cloud',
            href: '/solutions/role/devops',
            description: 'Cloud, Kubernetes, observability, and reliability skills.',
            icon: 'globe',
          },
          {
            label: 'Non-tech Functions',
            href: '/solutions/role/non-tech',
            description: 'Sales, support, finance, aptitude, and communication signals.',
            icon: 'building',
          },
        ],
      },
      {
        heading: 'By Stack',
        links: [
          {
            label: 'SAP',
            href: '/solutions/stack/sap',
            description: 'ABAP, HCM, FICO, and India enterprise implementation depth.',
            icon: 'india',
          },
          {
            label: 'Oracle',
            href: '/solutions/stack/oracle',
            description: 'EBS, HCM, banking systems, and migration-heavy roles.',
            icon: 'india',
          },
          {
            label: 'Salesforce / ServiceNow',
            href: '/solutions/stack/salesforce',
            description: 'Implementation, admin, integration, and CPQ assessment depth.',
            icon: 'india',
          },
          {
            label: 'Embedded / Mainframe / BFSI',
            href: '/solutions/stack/bfsi',
            description: 'Hard-to-source India stack coverage for GCC and BFSI teams.',
            icon: 'shield',
          },
        ],
      },
    ],
    promo: {
      eyebrow: 'India credibility',
      title: 'Talpro is Customer Zero',
      description: 'QOrium is dogfooded inside Talpro hiring before external proof is published.',
      href: '/customer/talpro-india',
      cta: 'See customer-zero proof',
      icon: 'india',
    },
  },
  {
    label: 'Why QOrium',
    href: '/method',
    columns: [
      {
        heading: 'The Method',
        links: [
          {
            label: 'The QOrium Method',
            href: '/method',
            description: 'AI-authored, expert-reviewed, evidence-led assessment operations.',
            icon: 'method',
          },
          {
            label: 'Assessment Science',
            href: '/science',
            description: 'IRT, validity language, bias checks, and score interpretation.',
            icon: 'data',
          },
          {
            label: 'Anti-Leak, Explained',
            href: '/anti-leak',
            description: 'Why static banks rot and how rotation changes the economics.',
            icon: 'leak',
          },
          {
            label: 'Author & Validate',
            href: '/authoring',
            description: 'The authoring pipeline from draft to released item.',
            icon: 'authoring',
          },
        ],
      },
      {
        heading: 'Trust & Compliance',
        links: [
          {
            label: 'Trust Center',
            href: '/trust',
            description: 'Security posture and evidence-gated trust surfaces.',
            icon: 'shield',
          },
          {
            label: 'DPDP & Data Handling',
            href: '/compliance-dpdp',
            description: 'India-first privacy posture and data-processing terms.',
            icon: 'lock',
          },
          {
            label: 'Security',
            href: '/security',
            description: 'Controls, sub-processors, headers, and operational hygiene.',
            icon: 'shield',
          },
          {
            label: 'Responsible AI',
            href: '/responsible-ai',
            description: 'What is shipped, what is beta, and what remains roadmap.',
            icon: 'method',
          },
        ],
      },
      {
        heading: 'Compare',
        links: [
          {
            label: 'vs Vervoe',
            href: '/vs/vervoe',
            description: 'Skills-first assessment comparison.',
            icon: 'compare',
          },
          {
            label: 'vs HackerRank',
            href: '/vs/hackerrank',
            description: 'Technical assessment platform comparison.',
            icon: 'compare',
          },
          {
            label: 'vs Mercer Mettl',
            href: '/vs/mettl',
            description: 'India enterprise assessment comparison.',
            icon: 'compare',
          },
          {
            label: 'vs iMocha / CoderByte',
            href: '/vs/imocha',
            description: 'Skills intelligence and coding assessment alternatives.',
            icon: 'compare',
          },
        ],
      },
    ],
    promo: {
      eyebrow: 'Manifesto',
      title: 'We show our work',
      description:
        'The public trust posture: no unsupported claims, no fake logos, no hidden caveats.',
      href: '/llm-info',
      cta: 'Read the brief',
      icon: 'shield',
    },
  },
  {
    label: 'Resources',
    href: '/resources',
    columns: [
      {
        heading: 'Learn',
        links: [
          {
            label: 'Guides & Playbooks',
            href: '/resources/guides',
            description: 'Practical assessment and anti-leak hiring guides.',
            icon: 'docs',
          },
          {
            label: 'Blog / Research',
            href: '/blog',
            description: 'Research-led essays on validity, leaks, and skills hiring.',
            icon: 'book',
          },
          {
            label: 'Glossary',
            href: '/glossary',
            description: 'Assessment, calibration, and role-graph vocabulary.',
            icon: 'book',
          },
        ],
      },
      {
        heading: 'Proof',
        links: [
          {
            label: 'Try JD-Forge',
            href: '/try/jd-forge',
            description: 'Paste a JD and see a live assessment plan generated from mapped skills.',
            icon: 'forge',
          },
          {
            label: 'Graded Answer Viewer',
            href: '/try/graded-answer',
            description: 'Inspect rubric scoring, reasoning, and audit metadata.',
            icon: 'benchmarks',
          },
          {
            label: 'Sample Packs',
            href: '/resources/sample-packs',
            description: 'Preview authored question packs and unlock the deeper pack by email.',
            icon: 'book',
            flag: 'samplePack',
          },
          {
            label: 'Case Studies',
            href: '/case-studies',
            description: 'Published only after real customer evidence lands.',
            icon: 'benchmarks',
            flag: 'caseStudies',
          },
          {
            label: 'Customer Stories',
            href: '/customers',
            description: 'External stories appear only with written permission.',
            icon: 'building',
            flag: 'customerStories',
          },
          {
            label: 'Benchmarks & Reports',
            href: '/benchmarks',
            description: 'Published measurement reports and methodology notes.',
            icon: 'benchmarks',
          },
        ],
      },
      {
        heading: 'Build',
        links: [
          {
            label: 'API Documentation',
            href: '/resources/docs',
            description: 'REST access, exports, and integration contracts.',
            icon: 'api',
          },
          {
            label: 'Changelog / Roadmap',
            href: '/changelog',
            description: 'What changed and what is planned.',
            icon: 'docs',
          },
          {
            label: 'Sample Packs',
            href: '/resources/sample-packs',
            description: 'Email-gated lead magnet backed by live capture endpoints.',
            icon: 'book',
            flag: 'samplePack',
          },
        ],
      },
    ],
    promo: {
      eyebrow: 'Featured guide',
      title: 'Why leaked banks rot',
      description: 'The market problem behind anti-leak rotation and defensible assessment ops.',
      href: '/blog/leak-problem',
      cta: 'Read the guide',
      icon: 'leak',
    },
  },
];

export const directNavLinks: NavLink[] = [{ label: 'Pricing', href: '/pricing', icon: 'pricing' }];

export const actionNavLinks: NavLink[] = [
  { label: 'Book a demo', href: '/demo', icon: 'book' },
  {
    label: 'Sign in',
    href: '/signin',
    icon: 'lock',
    flag: 'workspaceSignIn',
  },
];

export const footerSitemap: MegaMenuColumn[] = [
  {
    heading: 'Platform',
    links: [
      { label: 'Overview', href: '/platform' },
      { label: 'ReadyBank', href: '/platform/readybank' },
      { label: 'JD-Forge', href: '/platform/jd-forge' },
      { label: 'Stack-Vault', href: '/platform/stack-vault' },
      { label: 'Assessment Library', href: '/library' },
      { label: 'API Documentation', href: '/resources/docs' },
    ],
  },
  {
    heading: 'Solutions',
    links: [
      { label: 'Assessment Platforms', href: '/solutions/assessment-platforms' },
      { label: 'Enterprises & GCCs', href: '/solutions/enterprises-gcc' },
      { label: 'Staffing Firms', href: '/solutions/staffing-firms' },
      { label: 'Role Pages', href: '/solutions/role/software' },
      { label: 'Stack Pages', href: '/solutions/stack/sap' },
    ],
  },
  {
    heading: 'Why QOrium',
    links: [
      { label: 'Method', href: '/method' },
      { label: 'Science', href: '/science' },
      { label: 'Anti-Leak', href: '/anti-leak' },
      { label: 'Authoring', href: '/authoring' },
      { label: 'Trust Center', href: '/trust' },
      { label: 'Security & Residency', href: '/trust/security' },
      { label: 'Bias Audit', href: '/trust/bias-audit' },
      { label: 'Sub-processors', href: '/trust/sub-processors' },
      { label: 'DPDP Compliance', href: '/compliance-dpdp' },
      { label: 'Responsible AI', href: '/responsible-ai' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Guides', href: '/resources/guides' },
      { label: 'Blog', href: '/blog' },
      { label: 'Glossary', href: '/glossary' },
      { label: 'Benchmarks', href: '/benchmarks' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Try JD-Forge', href: '/try/jd-forge' },
      { label: 'Graded Answer Viewer', href: '/try/graded-answer' },
      { label: 'Sample Packs', href: '/resources/sample-packs', flag: 'samplePack' },
    ],
  },
  {
    heading: 'Compare',
    links: [
      { label: 'Vervoe', href: '/vs/vervoe' },
      { label: 'Mercer Mettl', href: '/vs/mettl' },
      { label: 'iMocha', href: '/vs/imocha' },
      { label: 'Coderbyte', href: '/vs/coderbyte' },
      { label: 'TechCurators', href: '/vs/techcurators' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Press', href: '/press-kit' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Book a demo', href: '/demo' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'DPA', href: '/dpa' },
    ],
  },
];

export function visibleLinks<T extends NavLink | MegaMenuPromo>(items: readonly T[]): T[] {
  return items.filter((item) => !item.flag || evidenceFlags[item.flag]);
}
