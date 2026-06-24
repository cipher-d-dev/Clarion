import "dotenv/config";
import * as Sentry from "@sentry/node";

// Must be called before any other imports that Sentry should instrument
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 0,
  });
}

import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./container.js";
import { startSLAJob } from "./jobs/sla-worker.js";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`🚀 Clarion API running on http://localhost:${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Health: http://localhost:${env.PORT}/v1/health`);

  startSLAJob(prisma);
});
