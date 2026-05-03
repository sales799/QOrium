// PM2 ecosystem entry point.
// Re-exports the canonical config from infra/B10-ecosystem.config.js
// so that `pm2 start ecosystem.config.cjs` works from the repo root.
//
// Use .cjs extension because the root package.json sets "type": "module"
// and PM2 requires CommonJS for its config file.

module.exports = require('./infra/B10-ecosystem.config.js');
