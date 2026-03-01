// Lazy-loaded DOMPurify wrapper to keep ~60KB out of the initial bundle.

let _DOMPurify: typeof import('dompurify').default | null = null;

async function getDOMPurify() {
  if (!_DOMPurify) {
    const mod = await import('dompurify');
    _DOMPurify = mod.default;
  }
  return _DOMPurify;
}

/**
 * Sanitize HTML string. Loads DOMPurify on first call.
 * For synchronous usage after first load, use `sanitizeSync`.
 */
export async function sanitize(
  dirty: string,
  config?: import('dompurify').Config
): Promise<string> {
  const purify = await getDOMPurify();
  return purify.sanitize(dirty, config) as string;
}

/**
 * Strip all HTML tags, returning plain text. Async.
 */
export async function sanitizeText(dirty: string): Promise<string> {
  return sanitize(dirty, { ALLOWED_TAGS: [] });
}

/**
 * Synchronous sanitize — only works after DOMPurify has been loaded at least once.
 * Falls back to basic escaping if not yet loaded.
 */
export function sanitizeSync(
  dirty: string,
  config?: import('dompurify').Config
): string {
  if (_DOMPurify) {
    return _DOMPurify.sanitize(dirty, config) as string;
  }
  // Basic fallback: strip tags
  return dirty.replace(/<[^>]*>/g, '');
}

/**
 * Preload DOMPurify so subsequent sync calls work.
 */
export function preloadSanitizer(): Promise<void> {
  return getDOMPurify().then(() => {});
}
