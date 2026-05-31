import { expect, test } from "@playwright/test";

test("recruiter builds an assessment, candidate submits it, and result renders", async ({ context, page, request }) => {
  const apiBaseUrl = `http://127.0.0.1:${process.env.QORIUM_E2E_API_PORT ?? 4210}`;
  const login = await request.post(`${apiBaseUrl}/api/v1/recruiter/login`, {
    data: {
      email: "recruiter@example.com",
      password: "dev-recruiter-password"
    }
  });
  expect(login.ok()).toBe(true);
  const recruiterCookie = login.headers()["set-cookie"]?.match(/qor_rec=([^;]+)/)?.[1];
  expect(recruiterCookie).toBeTruthy();
  await context.addCookies([
    {
      name: "qor_rec",
      value: recruiterCookie!,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax"
    }
  ]);

  await page.goto("/assessments/new");
  await expect(page.getByRole("heading", { name: "QOrium Assessment Builder" })).toBeVisible();
  await page.getByLabel("Assessment title").fill("Playwright Talent Screen");
  await page.getByLabel("Candidate email").fill("candidate@example.com");
  await page.getByRole("button", { name: "Save and sign link" }).click();

  const candidateLink = page.getByRole("link", { name: /\/candidate\// });
  await expect(candidateLink).toBeVisible();
  await candidateLink.click();

  await expect(page.getByRole("heading", { name: "Playwright Talent Screen" })).toBeVisible();
  const correctOptions = page.getByRole("button", {
    name: "Design for correctness first, then measure and optimize with observable evidence."
  });
  const count = await correctOptions.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    await correctOptions.nth(index).click();
  }

  await page.getByRole("button", { name: "Submit" }).click();
  await page.getByRole("link", { name: "View graded result" }).click();
  await expect(page.getByRole("heading", { name: "Graded result" })).toBeVisible();
  await expect(page.getByText("candidate@example.com")).toBeVisible();
  await expect(page.getByText("Score", { exact: true })).toBeVisible();
  await expect(page.getByText("Confidence", { exact: true })).toBeVisible();
});
