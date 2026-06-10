// BR-4 one-shot calibration runner (compiles to dist/grading/calibration-run.js).
// Invoked by cron / scheduled-task on the active origin from the readybank
// service dir so @qorium/db resolves and DATABASE_URL comes from runtime.secrets:
//
//   cd /opt/apps/qorium-marketing/services/readybank
//   node --env-file=runtime.secrets ./dist/grading/calibration-run.js
import { createPool } from '@qorium/db';
import { runCalibrationTick } from './calibration.js';

const pool = createPool({ applicationName: 'irt-calibration' });
try {
  const result = await runCalibrationTick(pool);
  console.log(JSON.stringify({ at: new Date().toISOString(), ...result }));
  if (result.first_defensible_item) {
    console.log(`FIRST_DEFENSIBLE_ITEM ${result.first_defensible_item} crossed n>=30`);
  }
} finally {
  await pool.end();
}
