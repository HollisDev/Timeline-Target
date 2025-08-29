// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

// Disable client Sentry in development to avoid interfering with dev server
if (process.env.NODE_ENV === 'production') {
  // Dynamically import to avoid bundling in dev
  import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn: 'https://218acb785cfe7bf37388cd369b801933@o4509856487243776.ingest.us.sentry.io/4509856495763456',
      integrations: [Sentry.replayIntegration()],
      tracesSampleRate: 1,
      enableLogs: true,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      debug: false,
    });
  });
}

export const onRouterTransitionStart = () => {};
