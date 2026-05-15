module.exports = {
  apps: [
    {
      name: 'qorium-web-v2-preview',
      cwd: '/opt/apps/qorium-web-v2-preview/apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 127.0.0.1 -p 4310',
      env: {
        NODE_ENV: 'production',
        PORT: '4310',
        QORIUM_PREVIEW_BASE_PATH: '/qorium-v2',
      },
      max_memory_restart: '512M',
      autorestart: true,
      time: true,
    },
  ],
};
