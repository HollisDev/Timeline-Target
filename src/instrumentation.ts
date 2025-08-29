// Temporarily disable Sentry instrumentation to resolve dev server hang on
// "Compiling /instrumentation ...". Re-enable once stable.
export async function register() {
  // no-op during development
}

export const onRequestError = () => {};
