/**
 * Global error reporter — installs window-level handlers that funnel
 * uncaught exceptions, unhandled promise rejections, and fetch failures
 * into the shared `error_logs` table via `logError`.
 *
 * Acts as a built-in (Sentry-style) reporter for the admin dashboard.
 */
import { logError } from './errorLogger';

type Severity = 'low' | 'medium' | 'high' | 'critical';

let installed = false;
const recentSignatures = new Map<string, number>();
const DEDUP_WINDOW_MS = 10_000;
const MAX_TRACKED = 200;

function shouldReport(signature: string): boolean {
  const now = Date.now();
  // Sweep expired entries
  if (recentSignatures.size > MAX_TRACKED) {
    for (const [key, ts] of recentSignatures) {
      if (now - ts > DEDUP_WINDOW_MS) recentSignatures.delete(key);
    }
  }
  const last = recentSignatures.get(signature);
  if (last && now - last < DEDUP_WINDOW_MS) return false;
  recentSignatures.set(signature, now);
  return true;
}

function isIgnorable(message: string): boolean {
  if (!message) return true;
  const m = message.toLowerCase();
  return (
    m.includes('resizeobserver loop') ||
    m.includes('non-error promise rejection captured') ||
    m.includes('script error.') ||
    m.includes('importing a module script failed')
  );
}

/**
 * Initialize global error capture. Safe to call multiple times.
 */
export function initGlobalErrorReporter() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  // 1. Uncaught synchronous errors
  window.addEventListener('error', (event: ErrorEvent) => {
    const message = event.message || String(event.error || 'Unknown error');
    if (isIgnorable(message)) return;
    const signature = `error:${message}:${event.filename}:${event.lineno}`;
    if (!shouldReport(signature)) return;

    void logError({
      error_type: 'console_error',
      error_message: message,
      error_stack: event.error?.stack,
      component_name: 'window.onerror',
      severity: 'high',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().toISOString(),
      },
    });
  });

  // 2. Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reason: any = event.reason;
    const message =
      reason instanceof Error
        ? reason.message
        : typeof reason === 'string'
        ? reason
        : JSON.stringify(reason)?.slice(0, 500) || 'Unhandled rejection';
    if (isIgnorable(message)) return;
    const signature = `rejection:${message}`;
    if (!shouldReport(signature)) return;

    void logError({
      error_type: 'unhandled_rejection',
      error_message: message,
      error_stack: reason instanceof Error ? reason.stack : undefined,
      component_name: 'unhandledrejection',
      severity: 'high',
      metadata: { timestamp: new Date().toISOString() },
    });
  });

  // 3. fetch() failures — wrap to capture network/API errors
  if (typeof window.fetch === 'function' && !(window as any).__fetchPatched) {
    (window as any).__fetchPatched = true;
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
          ? input.toString()
          : (input as Request).url;
      try {
        const response = await originalFetch(input, init);
        if (!response.ok && response.status >= 500) {
          const signature = `fetch:${response.status}:${url}`;
          if (shouldReport(signature)) {
            void logError({
              error_type: 'network_error',
              error_message: `HTTP ${response.status} ${response.statusText} on ${url}`,
              component_name: 'fetch',
              severity: response.status >= 500 ? 'critical' : 'medium',
              metadata: {
                status: response.status,
                method: init?.method || 'GET',
                url,
                timestamp: new Date().toISOString(),
              },
            });
          }
        }
        return response;
      } catch (err: any) {
        const message = err?.message || 'Network request failed';
        if (!isIgnorable(message)) {
          const signature = `fetch-throw:${message}:${url}`;
          if (shouldReport(signature)) {
            void logError({
              error_type: 'network_error',
              error_message: `${message} (${url})`,
              error_stack: err?.stack,
              component_name: 'fetch',
              severity: 'critical',
              metadata: {
                method: init?.method || 'GET',
                url,
                timestamp: new Date().toISOString(),
              },
            });
          }
        }
        throw err;
      }
    };
  }
}

/**
 * Report an authentication failure (sign-in, sign-up, OAuth, password reset).
 */
export async function logAuthFailure(
  action: 'sign_in' | 'sign_up' | 'oauth' | 'reset_password' | 'sign_out',
  error: any,
  context?: { email?: string; provider?: string }
) {
  const message =
    error instanceof Error ? error.message : error?.message || String(error || 'Auth failure');
  const severity: Severity =
    /invalid|incorrect|wrong/i.test(message) ? 'low' : 'medium';

  await logError({
    error_type: 'auth_failure',
    error_message: `[${action}] ${message}`,
    error_stack: error instanceof Error ? error.stack : undefined,
    user_email: context?.email,
    component_name: 'Auth',
    severity,
    metadata: {
      action,
      provider: context?.provider,
      status: error?.status,
      code: error?.code,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Report a route-level error from react-router (other than 404, which is
 * handled by NotFound.tsx).
 */
export async function logRouteError(routeError: any, pathname: string) {
  const message =
    routeError instanceof Error
      ? routeError.message
      : routeError?.statusText || String(routeError || 'Route error');
  await logError({
    error_type: 'route_error',
    error_message: `[${pathname}] ${message}`,
    error_stack: routeError instanceof Error ? routeError.stack : undefined,
    page_url: pathname,
    component_name: 'Router',
    severity: 'high',
    metadata: {
      status: routeError?.status,
      pathname,
      timestamp: new Date().toISOString(),
    },
  });
}
