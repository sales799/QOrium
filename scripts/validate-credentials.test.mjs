import assert from 'node:assert/strict';
import { test } from 'node:test';

import { summarizeResults } from './validate-credentials.mjs';

test('optional credential probe failures count as warnings, not blockers', () => {
  const summary = summarizeResults([
    {
      name: 'public:jdforge-health',
      status: 'FAIL',
      detail: 'https://api.qorium.online/jdf/v1/health -> HTTP 404',
      required: false,
      blocking: false,
    },
    {
      name: 'admin:public-lock',
      status: 'FAIL',
      detail: 'https://admin.qorium.online/ -> HTTP 200',
      required: false,
      blocking: false,
    },
  ]);

  assert.deepEqual(summary, {
    failCount: 2,
    blockingFailCount: 0,
    warningCount: 2,
    skipCount: 0,
  });
});

test('required credential failures stay blocking in strict mode output', () => {
  const summary = summarizeResults([
    {
      name: 'database',
      status: 'FAIL',
      detail: 'missing DATABASE_URL_PROD or DATABASE_URL',
      required: true,
      blocking: true,
    },
    {
      name: 'serper',
      status: 'FAIL',
      detail: 'Serper smoke -> HTTP 401',
      required: true,
      blocking: true,
    },
    {
      name: 'sentry',
      status: 'PASS',
      detail: 'DSN shape is valid',
      required: true,
      blocking: false,
    },
  ]);

  assert.deepEqual(summary, {
    failCount: 2,
    blockingFailCount: 2,
    warningCount: 0,
    skipCount: 0,
  });
});
