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

  test('/resources/docs — OpenAPI docs expose public API contract', async ({ page }) => {
    await page.goto('/resources/docs');

    await expect(
      page.getByRole('heading', { name: /api contracts are public-preview ready/i }),
    ).toBeVisible();
    await expect(page.getByText('https://qorium.online/v1', { exact: true })).toBeVisible();
    await expect(page.getByText('/sample-packs').first()).toBeVisible();
    await expect(page.getByRole('link', { name: /download openapi json/i })).toHaveAttribute(
      'href',
      '/openapi.json',
    );
  });

  test('/try — proof hub links to public demo surfaces', async ({ page }) => {
    await page.goto('/try');

    await expect(
      page.getByRole('heading', { name: /proof routes you can inspect/i }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /jd-forge demo/i })).toHaveAttribute(
      'href',
      '/try/jd-forge',
    );
    await expect(page.getByRole('link', { name: /graded-answer viewer/i })).toHaveAttribute(
      'href',
      '/try/graded-answer',
    );
  });

  test('/research — research hub links to benchmark and method surfaces', async ({ page }) => {
    await page.goto('/research');

    await expect(page.getByRole('heading', { name: /benchmark and method routes/i })).toBeVisible();
    await expect(
      page.getByRole('link', { name: /ai plagiarism benchmark protocol/i }),
    ).toHaveAttribute('href', '/research/plagiarism-benchmark');
    await expect(page.getByRole('link', { name: /science and calibration/i })).toHaveAttribute(
      'href',
      '/science',
    );
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

  test('/resources/sample-packs/senior-java — gated request reveals pack items', async ({
    page,
  }) => {
    await page.goto('/resources/sample-packs/senior-java');

    await expect(
      page.getByRole('heading', { name: /senior java sample pack/i }).first(),
    ).toBeVisible();
    await page.getByPlaceholder('Work email', { exact: true }).fill('buyer@example.com');
    await page.getByPlaceholder('Company', { exact: true }).fill('Example GCC');
    await page.getByPlaceholder('Role', { exact: true }).fill('Talent leader');
    const [unlockResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.request().method() === 'POST' &&
          response.url().includes('/v1/sample-packs/senior-java/unlock'),
      ),
      page.getByRole('button', { name: /get full pack/i }).click(),
    ]);

    expect(unlockResponse.status()).toBe(200);

    await expect(page.getByText(/Full pack items/i)).toBeVisible();
    await expect(page.getByText(/PDF delivery has been queued/i)).toBeVisible();
  });

  test('/ — buyer chatbot opens, cites roadmap, and captures lead', async ({ page }) => {
    await page.route('**/api/chatbot/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          data: {
            sessionId: 'chat_e2e',
            greeting:
              'Hi. I can answer QOrium buyer questions from cited public surfaces, route pricing to sales, or escalate to a human.',
          },
          error: null,
        }),
      });
    });
    await page.route('**/api/chatbot/message', async (route) => {
      const body = route.request().postDataJSON() as { message?: string };
      const isPricing = body.message?.toLowerCase().includes('pricing');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          data: isPricing
            ? {
                reply:
                  'QOrium does not quote pricing inside the chatbot. Share your work email, company, role, and one-line need, and sales will route the right plan.',
                intent: 'lead_capture',
                citations: [],
                escalate: true,
              }
            : {
                reply:
                  "No. QOrium's AI Interviewer is on the roadmap, not a shipped marketing-site capability.",
                intent: 'roadmap',
                citations: [
                  {
                    id: 'responsible-ai-roadmap',
                    title: 'Responsible AI',
                    url: '/responsible-ai',
                  },
                ],
                escalate: false,
              },
          error: null,
        }),
      });
    });
    await page.route('**/api/chatbot/lead-capture', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          data: { leadId: 'lead_e2e' },
          error: null,
        }),
      });
    });

    await page.goto('/');
    await page.getByRole('button', { name: /open qorium chatbot/i }).click();

    const chatbot = page.getByRole('dialog', { name: /QOrium answer desk/i });
    await expect(chatbot).toBeVisible();
    await chatbot.getByRole('button', { name: /do you have an ai interviewer/i }).click();
    await expect(chatbot.getByText(/roadmap, not a shipped/i)).toBeVisible();
    await expect(chatbot.getByRole('link', { name: /Responsible AI/i })).toHaveAttribute(
      'href',
      '/responsible-ai',
    );

    await chatbot.getByPlaceholder('Ask about QOrium').fill('What is pricing?');
    await chatbot.getByRole('button', { name: /send message/i }).click();
    await expect(chatbot.getByText(/does not quote pricing/i)).toBeVisible();

    await chatbot.getByPlaceholder('Work email').fill('buyer@example.com');
    await chatbot.getByPlaceholder('Company').fill('Example GCC');
    await chatbot.getByPlaceholder('Role').fill('Talent leader');
    await chatbot.getByPlaceholder('Need').fill('Demo');
    await chatbot.getByRole('button', { name: /request human follow-up/i }).click();

    await expect(chatbot.getByText(/human will reach out/i)).toBeVisible();
  });
});
