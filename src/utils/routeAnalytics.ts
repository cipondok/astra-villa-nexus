/**
 * Route analytics helpers — normalize concrete URLs into route patterns
 * so 404s can be aggregated per route (e.g. /properties/:id) instead of
 * per unique URL.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NUMERIC_RE = /^\d+$/;
const SLUG_ID_RE = /^[0-9a-z]{16,}$/i;

export interface RouteAnalysis {
  /** Normalized pattern, e.g. "/properties/:id" */
  pattern: string;
  /** The dynamic segment values found in the URL (affected IDs) */
  ids: string[];
}

/** Convert a pathname into a stable route pattern + extracted dynamic IDs. */
export function analyzeRoute(pathname: string): RouteAnalysis {
  const clean = (pathname || '/').split('?')[0].split('#')[0];
  const segments = clean.split('/').filter(Boolean);
  const ids: string[] = [];

  const pattern = segments
    .map((seg) => {
      const decoded = safeDecode(seg);
      if (UUID_RE.test(decoded)) {
        ids.push(decoded);
        return ':id';
      }
      if (NUMERIC_RE.test(decoded)) {
        ids.push(decoded);
        return ':num';
      }
      if (SLUG_ID_RE.test(decoded) && !/[-_]/.test(decoded)) {
        ids.push(decoded);
        return ':slug';
      }
      return decoded.toLowerCase();
    })
    .join('/');

  return { pattern: pattern ? `/${pattern}` : '/', ids };
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export interface RouteBucket {
  pattern: string;
  count: number;
  uniqueIds: string[];
  firstSeen: string;
  lastSeen: string;
  samples: Array<{ path: string; id?: string; at: string; referrer?: string | null }>;
}

export interface RawNotFoundLog {
  id?: string;
  error_page?: string | null;
  page_url?: string | null;
  referrer_url?: string | null;
  created_at: string;
  metadata?: Record<string, unknown> | null;
}

/** Aggregate raw 404 log rows into per-route buckets sorted by volume. */
export function aggregateNotFoundLogs(logs: RawNotFoundLog[]): RouteBucket[] {
  const map = new Map<string, RouteBucket>();

  for (const log of logs) {
    const path = normalizePath(log.error_page || log.page_url || '/');
    const { pattern, ids } = analyzeRoute(path);
    const at = log.created_at;

    let bucket = map.get(pattern);
    if (!bucket) {
      bucket = {
        pattern,
        count: 0,
        uniqueIds: [],
        firstSeen: at,
        lastSeen: at,
        samples: [],
      };
      map.set(pattern, bucket);
    }

    bucket.count += 1;
    if (at < bucket.firstSeen) bucket.firstSeen = at;
    if (at > bucket.lastSeen) bucket.lastSeen = at;
    for (const id of ids) {
      if (!bucket.uniqueIds.includes(id)) bucket.uniqueIds.push(id);
    }
    if (bucket.samples.length < 25) {
      bucket.samples.push({ path, id: ids[0], at, referrer: log.referrer_url ?? null });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

function normalizePath(value: string): string {
  if (!value) return '/';
  try {
    if (value.startsWith('http')) return new URL(value).pathname;
  } catch {
    /* ignore */
  }
  return value.split('?')[0].split('#')[0];
}
