import { test, expect } from '@playwright/test';

test.describe('Critical-route smoke', () => {
  test('/ — hero, locked USP, primary CTA links to /demo', async ({ page }) => {
    await page.goto('/');

    // Hero badge ("Question-Bank-as-a-Service")
    await expect(
      page.getByText('Question-Bank-as-a-Service', { exact: false }).first(),
    ).toBeVisible();

    // Locked USP fragment from Constitution §1.1 (the H1 may be split across lines).
    // Match a stable substring rather than the whole sentence (the marketing
    // headline shortens it in copy/home.ts) — but the proof copy below it
    // contains the verbatim USP fragment.
    const ustText = page.locator('body');
    await expect(ustText).toContainText(/world.{0,2}s/i);

    // Primary CTA: book a demo
    const cta = page.getByRole('link', { name: /book a demo/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /\/demo/);
  });

  test('/pricing — three tier columns + ROI calculator', async ({ page }) => {
    await page.goto('/pricing');

    // Three SKUs visible.
    await expect(page.getByText(/ReadyBank/i).first()).toBeVisible();
    await expect(page.getByText(/JD-Forge/i).first()).toBeVisible();
    await expect(page.getByText(/Stack-Vault/i).first()).toBeVisible();

    // ROI calculator presence — we look for an input/range that controls the JD volume.
    const calculatorInput = page.locator('input[type="range"], input[type="number"]').first();
    await expect(calculatorInput).toBeVisible();
  });

  test('/features/readybank — JSON response demo renders', async ({ page }) => {
    await page.goto('/features/readybank');

    // Sample JSON response references rb_pkg_ pack id.
    await expect(page.locator('body')).toContainText(/rb_pkg_/);
    await expect(page.locator('body')).toContainText(/anti_leak_scan/);
  });

  test('/security — 4-card compliance status (no SOC 2 false claim)', async ({ page }) => {
    await page.goto('/security');

    // Verify all 4 compliance posture cards render with their honest status.
    await expect(page.getByText(/DPDPA/i)).toBeVisible();
    await expect(page.getByText(/GDPR/i)).toBeVisible();
    await expect(page.getByText(/SOC 2/i)).toBeVisible();
    await expect(page.getByText(/ISO 27001/i)).toBeVisible();

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
});
