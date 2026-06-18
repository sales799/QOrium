import { test, expect } from '@playwright/test';

test.describe('Critical-route smoke', () => {
  test('/ — mega-menu is keyboard navigable and evidence-gated', async ({ page }) => {
    await page.goto('/');

    const platformTrigger = page.getByRole('button', { name: /Platform/i });
    await platformTrigger.focus();
    await page.keyboard.press('Enter');

    await expect(page.getByText(/The Assessment Library/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /ReadyBank/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /REST API/i }).first()).toBeVisible();

    await page.keyboard.press('Escape');
    const resourcesTrigger = page.getByRole('button', { name: /Resources/i });
    await resourcesTrigger.focus();
    await page.keyboard.press('Enter');

    await expect(page.getByRole('link', { name: /API Documentation/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Sample Packs/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Case Studies/i })).toHaveCount(0);
  });

  test('/ — mobile menu uses accordion panels', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await page.getByRole('button', { name: /Open menu/i }).click();
    await expect(page.getByRole('dialog', { name: /Qorium navigation/i })).toBeVisible();

    await page.getByRole('button', { name: /Platform/i }).click();
    await expect(page.getByRole('link', { name: /ReadyBank/i }).first()).toBeVisible();

    await page.getByRole('button', { name: /Resources/i }).click();
    await expect(page.getByRole('link', { name: /API Documentation/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Case Studies/i })).toHaveCount(0);
  });

  test('/ — hero, trust shell, primary CTA links to /demo', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: /Skills assessments you can defend in an audit/i }),
    ).toBeVisible();

    const body = page.locator('body');
    await expect(body).toContainText(/TRUST INFRASTRUCTURE FOR SKILLS HIRING/i);
    await expect(body).toContainText(/Evidence-gated/i);

    // Primary CTA: book a demo
    const cta = page.getByRole('link', { name: /book a demo/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /\/demo/);
  });

  test('/pricing — four plan columns + transparent INR posture', async ({ page }) => {
    await page.goto('/pricing');

    await expect(page.getByText(/Customer-Zero/i).first()).toBeVisible();
    await expect(page.getByText(/Growth/i).first()).toBeVisible();
    await expect(page.getByText(/Scale/i).first()).toBeVisible();
    await expect(page.getByText(/Enterprise/i).first()).toBeVisible();

    // RATIFIED 2026-06-03: public INR pricing (no "talk to sales" gate on paid tiers).
    const body = page.locator('body');
    await expect(body).toContainText(/Transparent INR pricing/i);
    await expect(body).toContainText(/₹4,999/);
    await expect(body).toContainText(/₹19,999/);
  });

  test('/platform/readybank — canonical pillar page renders (features collapsed in)', async ({
    page,
  }) => {
    await page.goto('/platform/readybank');

    await expect(page.getByRole('heading', { name: /ReadyBank/i }).first()).toBeVisible();
    await expect(page.locator('body')).toContainText(/doesn.t leak/i);
  });

  test('/features 301s to the canonical /platform surface', async ({ page }) => {
    await page.goto('/features/readybank');
    await expect(page).toHaveURL(/\/platform\/readybank/);
  });

  test('/security — control ledger renders with no SOC 2 false claim', async ({ page }) => {
    await page.goto('/security');

    await expect(page.getByRole('heading', { name: /Security posture/i })).toBeVisible();
    await expect(page.getByText(/Control ledger/i).first()).toBeVisible();
    await expect(page.getByText(/SOC 2 Type II/i)).toBeVisible();
    await expect(page.getByText(/ISO 27001/i).first()).toBeVisible();

    const body = await page.locator('body').textContent();
    expect(body).toMatch(/No SOC 2 or ISO badge claimed/i);
    expect(body).not.toMatch(/SOC 2 certified|ISO 27001 certified/i);
  });

  test('/contact — form renders with honeypot + submit button', async ({ page }) => {
    await page.goto('/contact');

    // Submit button exists.
    const submit = page.getByRole('button', { name: /send|submit|message/i }).first();
    await expect(submit).toBeVisible();

    // Honeypot field exists (hidden from users; bots fill it).
    const honeypot = page.locator('input[name="website"], input[name="honeypot"]').first();
    await expect(honeypot).toHaveCount(1);
  });

  test('/try/jd-forge — generates plan and queues email-gated PDF', async ({ page }) => {
    await page.goto('/try/jd-forge');

    await expect(page.getByRole('heading', { name: /Enter a role/i })).toBeVisible();
    await page.getByLabel('Job title').fill('AI Product Manager');
    await expect(page.locator('body')).toContainText(/Draft changed/i);

    await page.getByRole('button', { name: /Research title and publish plan/i }).click();
    await expect(page.locator('body')).toContainText(/AI Product Manager assessment/);
    await expect(page.locator('body')).toContainText(/AI Prompt Engineering/);
    await expect(page.locator('body')).toContainText(/Product discovery/);
    await expect(page.locator('body')).not.toContainText(/could not extract enough/i);

    await page.getByLabel(/Work email for assessment PDF/i).fill('buyer@example.com');
    await page.getByRole('button', { name: /^PDF$/i }).click();
    await expect(page.locator('body')).toContainText(/Plan PDF queued/i);

    await page.getByRole('tab', { name: /Paste JD/i }).click();
    await page.getByRole('button', { name: /Custom JD/i }).click();
    await page
      .getByLabel('Job description')
      .fill(
        'Network Engineer / IT Infrastructure & Support. Responsibilities: remote desktop support with AnyDesk and RDP, Azure Entra ID, Active Directory, Microsoft 365, AWS EC2 S3 IAM VPC WorkSpaces, Cisco switches routers firewalls, DNS DHCP VPN VLAN QoS, Windows Server patch management, backup and disaster recovery, ISO 27001 SOC 2 HIPAA GDPR, runbooks SOPs ITIL SLAs, PowerShell and Python automation.',
      );
    await expect(page.locator('body')).toContainText(/Draft changed/i);

    await page.getByRole('button', { name: /Generate assessment plan/i }).click();
    await expect(page.locator('body')).toContainText(/Network infrastructure troubleshooting/);
    await expect(page.locator('body')).toContainText(/Identity and access administration/);
    await expect(page.locator('body')).toContainText(/Windows Server administration/);
    await expect(page.locator('body')).toContainText(/Backup and disaster recovery/);
    await expect(page.locator('body')).not.toContainText(/could not extract enough/i);

    await page
      .getByLabel('Job description')
      .fill(
        'OpenText xPression Consultant with 8+ years of xPression development, platform upgrades, migration projects, template migration/remediation, performance tuning, troubleshooting, SQL Server, Windows platforms, and xPression versions 4.7 and 23.4. Must-Have Skills: Mandatory experience in xPression platform upgrades and migrations. Strong knowledge of template migration and remediation techniques. Expertise in performance tuning and troubleshooting. Experience working with SQL Server and Windows environments.',
      );
    await expect(page.locator('body')).toContainText(/Draft changed/i);

    await page.getByRole('button', { name: /Generate assessment plan/i }).click();
    await expect(page.locator('body')).toContainText(/OpenText xPression assessment/);
    await expect(page.locator('body')).toContainText(/OpenText xPression development/);
    await expect(page.locator('body')).toContainText(/xPression platform upgrade and migration/);
    await expect(page.locator('body')).toContainText(/Template migration and remediation/);
    await expect(page.locator('body')).not.toContainText(/could not extract enough/i);
  });

  test('/try/graded-answer — shows rubric audit trail and records feedback', async ({ page }) => {
    await page.goto('/try/graded-answer');

    await expect(page.getByRole('heading', { name: /rubric, the score/i })).toBeVisible();
    await expect(page.locator('body')).toContainText(/Rubric release/);
    await expect(page.locator('body')).toContainText(/Prompt fingerprint/);
    await expect(page.locator('body')).not.toContainText(/audit-fixture/);

    await page.getByRole('button', { name: /^Yes$/i }).click();
    await expect(page.locator('body')).toContainText(/Recorded/);
  });

  test('/resources/sample-packs — unlocks gated pack through email capture', async ({ page }) => {
    await page.goto('/resources/sample-packs/senior-java');

    await expect(page.locator('h1').filter({ hasText: /Senior Java Sample Pack/i })).toBeVisible();
    const unlockPanel = page.locator('aside').first();
    await unlockPanel.getByPlaceholder(/Work email/i).fill('buyer@example.com');
    await unlockPanel.getByPlaceholder('Company').fill('Example GCC');
    await unlockPanel.getByPlaceholder('Role').fill('Talent leader');
    await unlockPanel.getByRole('button', { name: /Unlock full pack/i }).click();

    await expect(page.locator('body')).toContainText(/Unlocked pack items/);
    await expect(page.locator('body')).toContainText(/PDF delivery has been queued by email/);
  });
});
