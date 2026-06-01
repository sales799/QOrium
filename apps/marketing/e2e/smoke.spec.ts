import { test, expect } from '@playwright/test';

test.describe('Critical-route smoke', () => {
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

  test('/pricing — four plan columns + honest paid-tier posture', async ({ page }) => {
    await page.goto('/pricing');

    await expect(page.getByText(/Customer-Zero/i).first()).toBeVisible();
    await expect(page.getByText(/Growth/i).first()).toBeVisible();
    await expect(page.getByText(/Scale/i).first()).toBeVisible();
    await expect(page.getByText(/Enterprise/i).first()).toBeVisible();

    const body = page.locator('body');
    await expect(body).toContainText(/Paid tier numbers are not public/i);
    await expect(body).toContainText(/Talk to sales/i);
  });

  test('/features/readybank — JSON response demo renders', async ({ page }) => {
    await page.goto('/features/readybank');

    // Sample JSON response references rb_pkg_ pack id.
    await expect(page.locator('body')).toContainText(/rb_pkg_/);
    await expect(page.locator('body')).toContainText(/anti_leak_scan/);
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

    await expect(page.getByRole('heading', { name: /Paste a JD/i })).toBeVisible();
    await page.getByRole('button', { name: /Generate assessment plan/i }).click();
    await expect(page.locator('body')).toContainText(/High coverage|Partial coverage/);

    await page.getByLabel(/Work email for assessment PDF/i).fill('buyer@example.com');
    await page.getByRole('button', { name: /^PDF$/i }).click();
    await expect(page.locator('body')).toContainText(/Plan PDF queued/i);
  });

  test('/try/graded-answer — shows rubric audit trail and records feedback', async ({ page }) => {
    await page.goto('/try/graded-answer');

    await expect(page.getByRole('heading', { name: /rubric, the score/i })).toBeVisible();
    await expect(page.locator('body')).toContainText(/rubricVersion/);
    await expect(page.locator('body')).toContainText(/promptHash/);

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
