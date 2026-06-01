import { test, expect } from '@playwright/test';

test.describe('Critical-route smoke', () => {
  test('/ — hero, locked USP, primary CTA links to /demo', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: /skills assessments you can defend/i }),
    ).toBeVisible();
    await expect(page.locator('body')).toContainText(/ReadyBank/i);
    await expect(page.locator('body')).toContainText(/JD-Forge/i);

    // Primary CTA: book a demo
    const cta = page.getByRole('link', { name: /book a demo/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /\/demo/);
  });

  test('/pricing — three SKU columns and sales CTA', async ({ page }) => {
    await page.goto('/pricing');

    await expect(page.getByText(/ReadyBank/i).first()).toBeVisible();
    await expect(page.getByText(/JD-Forge/i).first()).toBeVisible();
    await expect(page.getByText(/Stack-Vault/i).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /talk to sales/i }).first()).toBeVisible();
  });

  test('/features/readybank — JSON response demo renders', async ({ page }) => {
    await page.goto('/features/readybank');

    // Sample JSON response references rb_pkg_ pack id.
    await expect(page.locator('body')).toContainText(/rb_pkg_/);
    await expect(page.locator('body')).toContainText(/anti_leak_scan/);
  });

  test('/security — 4-card compliance status (no SOC 2 false claim)', async ({ page }) => {
    await page.goto('/security');

    await expect(page.getByText(/DPDP/i).first()).toBeVisible();
    await expect(page.getByText(/SOC 2/i).first()).toBeVisible();
    await expect(page.getByText(/ISO 27001/i).first()).toBeVisible();

    // Constitutional check: SOC 2 must be marked "in progress" — never claimed Type II.
    const body = await page.locator('body').textContent();
    expect(body?.toLowerCase()).toMatch(/(in progress|in-progress|roadmap)/);
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

  test('/try/jd-forge — live JD demo returns an assessment plan', async ({ page }) => {
    await page.goto('/try/jd-forge');

    await expect(page.getByRole('heading', { name: /paste a jd/i })).toBeVisible();
    await page
      .getByRole('button', { name: /generate assessment plan/i })
      .first()
      .click();
    await expect(page.getByText(/High coverage from seeded QOrium role graph/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /book a demo with this plan/i })).toBeVisible();
  });

  test('/try/graded-answer — grader theatre exposes audit metadata', async ({ page }) => {
    await page.goto('/try/graded-answer');

    await expect(page.getByRole('heading', { name: /see the rubric/i })).toBeVisible();
    await expect(page.getByText(/rubricVersion/i)).toBeVisible();
    await expect(page.getByText(/promptHash/i)).toBeVisible();
  });

  test('/resources/sample-packs/senior-java — gated unlock reveals pack items', async ({
    page,
  }) => {
    await page.goto('/resources/sample-packs/senior-java');

    await expect(
      page.getByRole('heading', { name: /senior java sample pack/i }).first(),
    ).toBeVisible();
    await page.getByPlaceholder('Work email', { exact: true }).fill('buyer@example.com');
    await page.getByPlaceholder('Company', { exact: true }).fill('Example GCC');
    await page.getByPlaceholder('Role', { exact: true }).fill('Talent leader');
    await page.getByRole('button', { name: /unlock full pack/i }).click();

    await expect(page.getByText(/Unlocked pack items/i)).toBeVisible();
    await expect(page.getByText(/PDF delivery has been queued/i)).toBeVisible();
  });
});
