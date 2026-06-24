import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 0,
  // Only capture errors, not replays — keeps the bundle lean
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});
