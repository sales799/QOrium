import { describe, expect, it } from 'vitest';

import {
  getGraderExemplar,
  getSamplePack,
  listGraderExemplars,
  listSamplePacks,
  runJdForgeDemo,
  runJdForgeFromJobTitle,
  sampleJds,
} from '../interactive-proof';
import { getLibrarySkill, getRolePage, getStackPage } from '../seo-graph';

const networkInfrastructureJd = `
Job description
Network Engineer / IT Infrastructure & Support

Key Responsibilities

1. Remote Desktop & End-User Support
Resolve hardware, software, and network-related issues via AnyDesk and RDP. Support
onboarding and configuration of Windows laptops for distributed teams.

2. Identity & Access Management
Manage Azure Entra ID, Active Directory, Microsoft 365 Admin Center, RBAC, group policies,
conditional access, Exchange Online, Teams, SharePoint, and OneDrive.

3. AWS Cloud Services Administration
Configure and monitor AWS EC2, S3, IAM, VPC, AWS WorkSpaces, IAM policies, and security groups.

4. Network Infrastructure & Cisco Hardware
Troubleshoot Cisco switches, routers, firewalls, DNS, DHCP, VPN, VLAN, bandwidth, and QoS.

5. On-Premises Server Administration
Maintain Windows Server, file servers, AD DS, Group Policy, health checks, patch management,
and capacity planning.

6. Security, Backup & Disaster Recovery
Support ISO 27001, SOC 2, HIPAA, GDPR, endpoint security, SSL certificates, backup schedules,
disaster recovery procedures, security incidents, and security audits.

7. Documentation & Knowledge Management
Create network diagrams, SOPs, runbooks, incident logs, and knowledge base articles. Explain
technical issues to non-technical stakeholders.

Technical Skills Required: PowerShell, Python, network monitoring, log analysis, ITIL v4,
runbooks, SOPs, change management.
`;

const generatedJdMetadataLabels = [
  'Title',
  'Seniority',
  'Domain',
  'Role family',
  'Research basis',
  'Assessment Focus',
  'QOrium role-title research synthesized this JD from',
];

describe('interactive proof fixtures', () => {
  it('ships the six default JD-Forge sample JDs from the spec', () => {
    expect(sampleJds.map((sample) => sample.id)).toEqual([
      'senior-java',
      'senior-react',
      'devops-sre',
      'salesforce',
      'embedded-c',
      'sap-abap',
    ]);
  });

  it('returns a real JD-Forge assessment plan with linked skills', () => {
    const demo = runJdForgeDemo(sampleJds[0]!.body);
    const skillNames = demo.skills.map((skill) => skill.name);

    expect(demo.ok).toBe(true);
    expect(demo.skills.length).toBeGreaterThanOrEqual(5);
    expect(skillNames).not.toContain('Client performance debugging');
    expect(demo.assessment.itemCount).toBe(20);
    expect(demo.lowConfidenceReason).toBeUndefined();
    expect(demo.skills.every((skill) => skill.libraryHref.startsWith('/library/'))).toBe(true);
  });

  it('keeps frontend performance extraction scoped to frontend JDs', () => {
    const demo = runJdForgeDemo(sampleJds[1]!.body);

    expect(demo.skills.map((skill) => skill.name)).toContain('Client performance debugging');
  });

  it('generates a useful plan for a newly pasted data engineering JD', () => {
    const demo = runJdForgeDemo(
      'Senior Python data engineer with Python, SQL, Airflow, dbt, Snowflake, data modeling, AWS Glue, and production data pipeline ownership.',
    );
    const skillNames = demo.skills.map((skill) => skill.name);

    expect(demo.roleTitle).toBe('Data engineering assessment');
    expect(skillNames).toEqual(
      expect.arrayContaining([
        'Python production engineering',
        'Data pipeline orchestration',
        'Analytics engineering with dbt',
        'Cloud data warehousing',
        'SQL data modeling',
        'AWS production systems',
      ]),
    );
    expect(demo.skills.length).toBeGreaterThanOrEqual(6);
    expect(demo.assessment.itemCount).toBe(20);
    expect(demo.lowConfidenceReason).toBeUndefined();
  });

  it('generates a broad IT infrastructure plan from a pasted network engineer JD', () => {
    const demo = runJdForgeDemo(networkInfrastructureJd);
    const skillNames = demo.skills.map((skill) => skill.name);

    expect(demo.roleTitle).toBe('IT infrastructure assessment');
    expect(skillNames).toEqual(
      expect.arrayContaining([
        'Network infrastructure troubleshooting',
        'Identity and access administration',
        'Microsoft 365 administration',
        'Windows Server administration',
        'Backup and disaster recovery',
        'Security compliance operations',
        'ITIL service operations',
        'IT operations automation',
        'AWS production systems',
        'Technical Communication',
      ]),
    );
    expect(demo.skills.length).toBeGreaterThanOrEqual(10);
    expect(demo.assessment.coverageBadge).toMatch(/High coverage/);
    expect(demo.lowConfidenceReason).toBeUndefined();
  });

  it('derives a useful plan from a non-seeded professional skill list', () => {
    const demo = runJdForgeDemo(
      'Growth marketing manager responsible for campaign reporting and funnel optimization. Technical skills required: Google Analytics, HubSpot CRM, lifecycle email, A/B testing, SEO content, paid acquisition.',
    );
    const skillNames = demo.skills.map((skill) => skill.name);

    expect(skillNames).toEqual(
      expect.arrayContaining([
        'Google Analytics',
        'HubSpot CRM',
        'lifecycle email',
        'A/B testing',
        'SEO content',
      ]),
    );
    expect(demo.skills.length).toBeGreaterThanOrEqual(5);
    expect(demo.lowConfidenceReason).toBeUndefined();
  });

  it('researches a job title into a generated JD and published assessment plan', () => {
    const demo = runJdForgeFromJobTitle('AI Product Manager');
    const skillNames = demo.skills.map((skill) => skill.name);

    expect(demo.roleTitle).toBe('AI Product Manager assessment');
    expect(demo.source.mode).toBe('job-title');
    expect(demo.source.jobTitle).toBe('AI Product Manager');
    expect(demo.source.generatedJd).toContain('Research basis');
    expect(demo.source.generatedJd).toContain('Technical Skills Required');
    expect(demo.source.researchSignals).toEqual(
      expect.arrayContaining(['product role benchmark', 'AI-era skill overlay']),
    );
    expect(skillNames).toEqual(
      expect.arrayContaining([
        'AI Prompt Engineering',
        'Product discovery',
        'Roadmap prioritization',
        'PRD writing',
        'Product analytics',
      ]),
    );
    for (const label of generatedJdMetadataLabels) {
      expect(skillNames).not.toContain(label);
    }
    expect(skillNames).not.toContain('Microsoft 365 administration');
    expect(skillNames).not.toContain('Remote desktop and endpoint support');
    expect(demo.skills.length).toBeGreaterThanOrEqual(10);
    expect(demo.assessment.itemCount).toBe(20);
    expect(demo.lowConfidenceReason).toBeUndefined();
  });

  it('researches non-technology job titles without requiring a pasted JD', () => {
    const demo = runJdForgeFromJobTitle('Healthcare Recruiter');
    const skillNames = demo.skills.map((skill) => skill.name);

    expect(demo.source.mode).toBe('job-title');
    expect(demo.source.generatedJd).toContain('Healthcare Recruiter');
    expect(skillNames).toEqual(
      expect.arrayContaining([
        'Candidate sourcing',
        'Screening interviews',
        'ATS workflow management',
        'Recruitment analytics',
      ]),
    );
    for (const label of generatedJdMetadataLabels) {
      expect(skillNames).not.toContain(label);
    }
    expect(skillNames).not.toContain('Remote desktop and endpoint support');
    expect(skillNames).not.toContain('Microsoft 365 administration');
    expect(demo.skills.length).toBeGreaterThanOrEqual(8);
    expect(demo.lowConfidenceReason).toBeUndefined();
  });

  it('keeps enterprise-app job title research scoped to the named platform', () => {
    const demo = runJdForgeFromJobTitle('SAP MM Consultant');
    const skillNames = demo.skills.map((skill) => skill.name);

    expect(demo.roleTitle).toBe('SAP MM Consultant assessment');
    expect(skillNames).toEqual(
      expect.arrayContaining([
        'SAP functional configuration',
        'SAP integration diagnostics',
        'Business process mapping',
        'UAT coordination',
      ]),
    );
    for (const label of generatedJdMetadataLabels) {
      expect(skillNames).not.toContain(label);
    }
    expect(skillNames).not.toContain('Salesforce Apex');
    expect(skillNames).not.toContain('SOQL data access');
    expect(skillNames).not.toContain('Finacle / Flexcube core banking');
    expect(demo.lowConfidenceReason).toBeUndefined();
  });

  it('uses an honest low-confidence state instead of padding unmapped text', () => {
    const demo = runJdForgeDemo('We need someone flexible who can help with internal projects.');

    expect(demo.ok).toBe(true);
    expect(demo.skills).toHaveLength(0);
    expect(demo.lowConfidenceReason).toMatch(/could not extract/i);
  });

  it('still generates a partial plan for a sparse but mapped custom JD', () => {
    const demo = runJdForgeDemo('Python engineer for production automation and internal tooling.');

    expect(demo.skills.map((skill) => skill.name)).toContain('Python production engineering');
    expect(demo.assessment.itemCount).toBe(10);
    expect(demo.lowConfidenceReason).toBeUndefined();
  });

  it('seeds grader exemplars with reproducible audit metadata', () => {
    const exemplars = listGraderExemplars();

    expect(exemplars.length).toBeGreaterThanOrEqual(8);
    for (const summary of exemplars) {
      const full = getGraderExemplar(summary.id);
      expect(full?.auditMeta.rubricVersion).toMatch(/^rubric-/);
      expect(full?.auditMeta.modelVersion).toBeTruthy();
      expect(full?.auditMeta.promptHash).toMatch(/^sha256:/);
      expect(full?.auditMeta.inputHash).toMatch(/^sha256:/);
    }
  });

  it('publishes all 13 sample-pack lead magnets with honest calibration badges', () => {
    const packs = listSamplePacks();

    expect(packs).toHaveLength(13);
    for (const pack of packs) {
      const full = getSamplePack(pack.slug);
      expect(full?.calibrationBadge).toMatch(/calibration pending/i);
      expect(full?.previewItems.length).toBeGreaterThanOrEqual(2);
      expect(full?.previewItems.length).toBeLessThanOrEqual(3);
      expect(full?.itemCount).toBeGreaterThan(full?.previewItems.length ?? 0);
    }
  });

  it('links every public sample-pack CTA to shipped Phase 3/4 pages', () => {
    for (const pack of listSamplePacks()) {
      const librarySlug = pack.libraryHref.replace('/library/', '');
      const roleSlug = pack.roleHref.replace('/solutions/role/', '');
      const stackSlug = pack.stackHref.replace('/solutions/stack/', '');

      expect(pack.libraryHref).toMatch(/^\/library\//);
      expect(pack.roleHref).toMatch(/^\/solutions\/role\//);
      expect(pack.stackHref).toMatch(/^\/solutions\/stack\//);
      expect(getLibrarySkill(librarySlug)).toBeDefined();
      expect(getRolePage(roleSlug)).toBeDefined();
      expect(getStackPage(stackSlug)).toBeDefined();
    }
  });
});
