export type ApiMethod = 'GET' | 'POST';

export interface PublicApiEndpoint {
  method: ApiMethod;
  path: string;
  summary: string;
  availability: 'Live public proof' | 'Lead gated' | 'Feedback capture';
}

export interface PublicApiGroup {
  name: string;
  description: string;
  endpoints: PublicApiEndpoint[];
}

export interface PublicSdkExample {
  language: 'Node.js' | 'Python';
  install: string;
  code: string;
}

export const publicApiBaseUrl = 'https://qorium.online/v1';
export const publicApiDocsUpdated = '2026-06-03';
export const postmanCollectionHref = '/docs/qorium-public-proof.postman_collection.json';

export const publicSdkExamples: PublicSdkExample[] = [
  {
    language: 'Node.js',
    install: 'Uses native fetch in Node 20+',
    code: `const QORIUM = 'https://qorium.online/v1';
const headers = {
  Authorization: \`Bearer \${process.env.QORIUM_API_KEY}\`,
  'Content-Type': 'application/json',
};

const plan = await fetch(\`\${QORIUM}/jd-forge/demo\`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    jd_text: 'Senior Java Engineer with Spring Boot, SQL, microservices, and AWS.',
  }),
}).then((res) => res.json());

const packs = await fetch(\`\${QORIUM}/sample-packs\`, { headers }).then((res) => res.json());
console.log(plan.data.planId, packs.data.length);`,
  },
  {
    language: 'Python',
    install: 'pip install requests',
    code: `import os
import requests

BASE = "https://qorium.online/v1"
HEADERS = {
    "Authorization": f"Bearer {os.environ['QORIUM_API_KEY']}",
    "Content-Type": "application/json",
}

plan = requests.post(
    f"{BASE}/jd-forge/demo",
    headers=HEADERS,
    json={
        "jd_text": "Senior Java Engineer with Spring Boot, SQL, microservices, and AWS."
    },
).json()

packs = requests.get(f"{BASE}/sample-packs", headers=HEADERS).json()
print(plan["data"]["planId"], len(packs["data"]))`,
  },
];

export const webhookVerificationExample = `import crypto from 'node:crypto';

function verifyQoriumWebhook(rawBody, signature, signingSecret) {
  const expected = crypto
    .createHmac('sha256', signingSecret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature.replace('sha256=', ''), 'hex'),
    Buffer.from(expected, 'hex'),
  );
}`;

export const publicApiGroups: PublicApiGroup[] = [
  {
    name: 'JD-Forge demo',
    description: 'Convert a pasted job description into a public-preview assessment plan.',
    endpoints: [
      {
        method: 'POST',
        path: '/jd-forge/demo',
        summary: 'Generate extracted skills, coverage, and a recruiter-facing assessment plan.',
        availability: 'Live public proof',
      },
      {
        method: 'POST',
        path: '/jd-forge/demo/plan-pdf',
        summary: 'Create a signed gated download link for the generated plan artifact.',
        availability: 'Lead gated',
      },
    ],
  },
  {
    name: 'Sample packs',
    description: 'Expose preview packs and capture buyer-qualified unlocks.',
    endpoints: [
      {
        method: 'GET',
        path: '/sample-packs',
        summary: 'List public sample packs with preview counts and calibration status.',
        availability: 'Live public proof',
      },
      {
        method: 'GET',
        path: '/sample-packs/{slug}/preview',
        summary: 'Preview openly visible items from one sample pack.',
        availability: 'Live public proof',
      },
      {
        method: 'POST',
        path: '/sample-packs/{slug}/unlock',
        summary: 'Unlock gated pack items for a work email, company, and buyer role.',
        availability: 'Lead gated',
      },
    ],
  },
  {
    name: 'Grader exemplars',
    description: 'Show audited answer examples and collect quality feedback without exposing PII.',
    endpoints: [
      {
        method: 'GET',
        path: '/grader/exemplars',
        summary: 'List public answer exemplars and rubric metadata.',
        availability: 'Live public proof',
      },
      {
        method: 'GET',
        path: '/grader/exemplars/{id}',
        summary: 'Fetch one exemplar with grading rationale and audit fields.',
        availability: 'Live public proof',
      },
      {
        method: 'POST',
        path: '/grader/exemplars/{id}/feedback',
        summary: 'Capture a usefulness vote for an exemplar.',
        availability: 'Feedback capture',
      },
    ],
  },
  {
    name: 'Trust and science proof',
    description: 'Expose non-sensitive evidence behind the public trust pages.',
    endpoints: [
      {
        method: 'GET',
        path: '/content/pipeline-stats',
        summary: 'Publish authored-item and calibration pipeline counts.',
        availability: 'Live public proof',
      },
      {
        method: 'GET',
        path: '/science/quality-gate',
        summary: 'Return current quality-gate scorecard metadata.',
        availability: 'Live public proof',
      },
      {
        method: 'GET',
        path: '/science/plagiarism-bench',
        summary: 'Return public anti-plagiarism benchmark evidence.',
        availability: 'Live public proof',
      },
      {
        method: 'GET',
        path: '/responsible-ai/status',
        summary: 'Return shipped-versus-roadmap AI capability status.',
        availability: 'Live public proof',
      },
    ],
  },
];

const jsonEnvelope = {
  type: 'object',
  required: ['ok', 'data', 'error'],
  properties: {
    ok: { type: 'boolean' },
    data: {},
    error: {
      anyOf: [{ $ref: '#/components/schemas/ApiError' }, { type: 'null' }],
    },
  },
};

const standardErrorResponse = {
  description: 'Request failed.',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ApiEnvelope' },
    },
  },
};

function okResponse(description: string) {
  return {
    description,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ApiEnvelope' },
      },
    },
  };
}

export const publicOpenApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'QOrium Public Proof API',
    version: '0.1.0-preview',
    summary: 'Live public-preview contracts for QOrium proof and demo workflows.',
    description:
      'QOrium publishes live public proof endpoints for JD-Forge, sample packs, grader exemplars, and trust evidence. Customer ReadyBank and Stack-Vault APIs remain early-access and are not represented as public live routes here.',
  },
  externalDocs: {
    description: 'SDK examples and Postman collection',
    url: 'https://qorium.online/resources/docs',
  },
  'x-qorium-postman-collection': postmanCollectionHref,
  'x-qorium-sdk-languages': publicSdkExamples.map((example) => example.language),
  servers: [
    {
      url: publicApiBaseUrl,
      description: 'QOrium public proof API',
    },
  ],
  tags: publicApiGroups.map((group) => ({
    name: group.name,
    description: group.description,
  })),
  paths: {
    '/jd-forge/demo': {
      post: {
        tags: ['JD-Forge demo'],
        summary: 'Generate a JD-Forge demo assessment plan',
        operationId: 'createJdForgeDemoPlan',
        'x-qorium-stage': 'live-public-proof',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/JdForgeDemoRequest' },
            },
          },
        },
        responses: {
          '200': okResponse('Generated assessment plan.'),
          '400': standardErrorResponse,
        },
      },
    },
    '/jd-forge/demo/plan-pdf': {
      post: {
        tags: ['JD-Forge demo'],
        summary: 'Create a signed gated plan download',
        operationId: 'createJdForgePlanPdf',
        'x-qorium-stage': 'lead-gated',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LeadCaptureRequest' },
            },
          },
        },
        responses: { '200': okResponse('Signed PDF link.'), '400': standardErrorResponse },
      },
    },
    '/sample-packs': {
      get: {
        tags: ['Sample packs'],
        summary: 'List public sample packs',
        operationId: 'listSamplePacks',
        'x-qorium-stage': 'live-public-proof',
        responses: { '200': okResponse('Public sample packs.') },
      },
    },
    '/sample-packs/{slug}/preview': {
      get: {
        tags: ['Sample packs'],
        summary: 'Preview one sample pack',
        operationId: 'previewSamplePack',
        'x-qorium-stage': 'live-public-proof',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': okResponse('Sample pack preview.'), '404': standardErrorResponse },
      },
    },
    '/sample-packs/{slug}/unlock': {
      post: {
        tags: ['Sample packs'],
        summary: 'Unlock a public sample pack',
        operationId: 'unlockSamplePack',
        'x-qorium-stage': 'lead-gated',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LeadCaptureRequest' },
            },
          },
        },
        responses: { '200': okResponse('Unlocked sample pack.'), '400': standardErrorResponse },
      },
    },
    '/grader/exemplars': {
      get: {
        tags: ['Grader exemplars'],
        summary: 'List answer exemplars',
        operationId: 'listGraderExemplars',
        'x-qorium-stage': 'live-public-proof',
        responses: { '200': okResponse('Public exemplar list.') },
      },
    },
    '/grader/exemplars/{id}': {
      get: {
        tags: ['Grader exemplars'],
        summary: 'Fetch one answer exemplar',
        operationId: 'getGraderExemplar',
        'x-qorium-stage': 'live-public-proof',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': okResponse('Answer exemplar.'), '404': standardErrorResponse },
      },
    },
    '/grader/exemplars/{id}/feedback': {
      post: {
        tags: ['Grader exemplars'],
        summary: 'Submit exemplar feedback',
        operationId: 'submitGraderExemplarFeedback',
        'x-qorium-stage': 'feedback-capture',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['vote'],
                properties: { vote: { enum: ['up', 'down'] } },
              },
            },
          },
        },
        responses: { '202': okResponse('Feedback accepted.'), '400': standardErrorResponse },
      },
    },
    '/content/pipeline-stats': {
      get: {
        tags: ['Trust and science proof'],
        summary: 'Get content pipeline stats',
        operationId: 'getContentPipelineStats',
        'x-qorium-stage': 'live-public-proof',
        responses: { '200': okResponse('Pipeline stats.') },
      },
    },
    '/science/quality-gate': {
      get: {
        tags: ['Trust and science proof'],
        summary: 'Get quality gate metadata',
        operationId: 'getQualityGate',
        'x-qorium-stage': 'live-public-proof',
        responses: { '200': okResponse('Quality gate metadata.') },
      },
    },
    '/science/plagiarism-bench': {
      get: {
        tags: ['Trust and science proof'],
        summary: 'Get plagiarism benchmark metadata',
        operationId: 'getPlagiarismBenchmark',
        'x-qorium-stage': 'live-public-proof',
        responses: { '200': okResponse('Plagiarism benchmark metadata.') },
      },
    },
    '/responsible-ai/status': {
      get: {
        tags: ['Trust and science proof'],
        summary: 'Get responsible-AI status',
        operationId: 'getResponsibleAiStatus',
        'x-qorium-stage': 'live-public-proof',
        responses: { '200': okResponse('Responsible-AI status.') },
      },
    },
  },
  components: {
    schemas: {
      ApiEnvelope: jsonEnvelope,
      ApiError: {
        type: 'object',
        required: ['code', 'message'],
        properties: {
          code: { type: 'string' },
          message: { type: 'string' },
          details: { type: 'object', additionalProperties: true },
        },
      },
      JdForgeDemoRequest: {
        type: 'object',
        required: ['jd_text'],
        properties: {
          jd_text: { type: 'string', minLength: 20, maxLength: 12000 },
        },
      },
      LeadCaptureRequest: {
        type: 'object',
        required: ['email', 'company', 'role'],
        properties: {
          email: { type: 'string', format: 'email' },
          company: { type: 'string', minLength: 2 },
          role: { type: 'string', minLength: 2 },
          need: { type: 'string' },
        },
      },
    },
  },
} as const;
