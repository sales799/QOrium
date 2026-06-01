import { describe, expect, it } from 'vitest';

import { POST as postJdDemo } from '../jd-forge/demo/route';
import { POST as postPlanPdf } from '../jd-forge/demo/plan-pdf/route';
import { GET as listExemplars } from '../grader/exemplars/route';
import { GET as getExemplar } from '../grader/exemplars/[id]/route';
import { POST as postFeedback } from '../grader/exemplars/[id]/feedback/route';
import { GET as listPacks } from '../sample-packs/route';
import { GET as previewPack } from '../sample-packs/[slug]/preview/route';
import { POST as unlockPack } from '../sample-packs/[slug]/unlock/route';

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '127.0.0.42' },
    body: JSON.stringify(body),
  });
}

describe('interactive proof public routes', () => {
  it('POST /v1/jd-forge/demo returns extracted skills and an assessment plan', async () => {
    const response = await postJdDemo(
      jsonRequest('https://qorium.test/v1/jd-forge/demo', {
        jd_text:
          'Senior Java Engineer with Java 21, Spring Boot, Hibernate, SQL, microservices, AWS, and circuit breaker experience.',
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.skills.length).toBeGreaterThanOrEqual(5);
    expect(payload.data.assessment.itemCount).toBe(20);
  });

  it('POST /v1/jd-forge/demo/plan-pdf is email gated', async () => {
    const response = await postPlanPdf(
      jsonRequest('https://qorium.test/v1/jd-forge/demo/plan-pdf', {
        email: 'buyer@example.com',
        plan_id: 'jdplan_1234567',
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(202);
    expect(payload.data.delivery).toBe('email');
    expect(payload.data.emailCaptured).toBe(true);
    expect(payload.data.mailer).toEqual({ buyer: 'console', internal: 'console' });
    expect(payload.data.signedUrl).toMatch(/\/v1\/jd-forge\/demo\/plan-pdf/);
  });

  it('serves curated grader exemplar lists and details', async () => {
    const listResponse = await listExemplars(
      new Request('https://qorium.test/v1/grader/exemplars'),
    );
    const listPayload = await listResponse.json();
    const firstId = listPayload.data.exemplars[0].id;

    const detailResponse = await getExemplar(
      new Request(`https://qorium.test/v1/grader/exemplars/${firstId}`),
      { params: Promise.resolve({ id: firstId }) },
    );
    const detailPayload = await detailResponse.json();

    expect(listResponse.status).toBe(200);
    expect(detailPayload.data.auditMeta.promptHash).toMatch(/^sha256:/);
  });

  it('records grader fairness feedback without mutating the exemplar score', async () => {
    const response = await postFeedback(
      jsonRequest('https://qorium.test/v1/grader/exemplars/java-jmm-happens-before/feedback', {
        vote: 'up',
      }),
      { params: Promise.resolve({ id: 'java-jmm-happens-before' }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(202);
    expect(payload.data.recorded).toBe(true);
    expect(payload.data.scoreChanged).toBe(false);
  });

  it('serves sample-pack list, preview, and gated unlock flow', async () => {
    const listResponse = await listPacks(new Request('https://qorium.test/v1/sample-packs'));
    const listPayload = await listResponse.json();
    const slug = listPayload.data.packs[0].slug;

    const previewResponse = await previewPack(
      new Request(`https://qorium.test/v1/sample-packs/${slug}/preview`),
      { params: Promise.resolve({ slug }) },
    );
    const previewPayload = await previewResponse.json();
    const unlockResponse = await unlockPack(
      jsonRequest(`https://qorium.test/v1/sample-packs/${slug}/unlock`, {
        email: 'buyer@example.com',
        company: 'Example GCC',
        role: 'Talent leader',
      }),
      { params: Promise.resolve({ slug }) },
    );
    const unlockPayload = await unlockResponse.json();

    expect(listResponse.status).toBe(200);
    expect(previewPayload.data.previewItems.length).toBeLessThanOrEqual(3);
    expect(unlockResponse.status).toBe(200);
    expect(unlockPayload.data.pack.gatedItems.length).toBeGreaterThan(0);
    expect(unlockPayload.data.pdfDelivery).toBe('email');
    expect(unlockPayload.data.mailer).toEqual({ buyer: 'console', internal: 'console' });
    expect(unlockPayload.data.pdfUrl).toMatch(/\/v1\/sample-packs\/.+\/pdf/);
  });
});
