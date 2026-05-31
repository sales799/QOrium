const apiPort = Number(process.env.QORIUM_API_PORT ?? 4100);
const webPort = Number(process.env.QORIUM_WEB_PORT ?? 3000);
const sandboxPort = Number(process.env.QORIUM_SANDBOX_PORT ?? 4102);

module.exports = {
  apps: [
    {
      name: "qorium-web",
      cwd: "/opt/apps/qorium/qorium-app/apps/web",
      script: "../../node_modules/.bin/next",
      args: `start -p ${webPort}`,
      exec_mode: "cluster",
      instances: Number(process.env.QORIUM_WEB_INSTANCES ?? 2),
      env: {
        NODE_ENV: "production",
        PORT: webPort,
        NEXT_PUBLIC_API_BASE_URL: process.env.QORIUM_PROD_API_URL ?? "https://api.qorium.online"
      },
      max_memory_restart: "768M",
      time: true
    },
    {
      name: "qorium-api",
      cwd: "/opt/apps/qorium/qorium-app",
      script: "./node_modules/.bin/tsx",
      args: "apps/api/src/server.ts",
      exec_mode: "cluster",
      instances: Number(process.env.QORIUM_API_INSTANCES ?? 2),
      env: {
        NODE_ENV: "production",
        PORT: apiPort,
        DATABASE_URL: process.env.DATABASE_URL,
        REDIS_URL: process.env.REDIS_URL,
        QORIUM_SIGNING_SECRET: process.env.QORIUM_SIGNING_SECRET,
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
        OPENROUTER_MODEL: process.env.OPENROUTER_MODEL
      },
      max_memory_restart: "768M",
      time: true
    },
    {
      name: "qorium-sandbox-bridge",
      cwd: "/opt/apps/qorium/qorium-app",
      script: "./node_modules/.bin/tsx",
      args: "apps/sandbox-bridge/src/server.ts",
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "production",
        PORT: sandboxPort
      },
      max_memory_restart: "512M",
      time: true
    }
  ]
};
