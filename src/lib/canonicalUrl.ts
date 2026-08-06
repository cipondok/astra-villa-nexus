import { SITE_URL as DEFAULT_SITE_URL } from '@/lib/seoDefaults';

/** Canonical origin for all public URLs. */
export const SITE_ORIGIN = DEFAULT_SITE_URL.replace(/\/+$/, '');

/** Matches both the canonical `/property/:id` and the legacy `/properties/:id` route. */
export const PROPERTY_DETAIL_PATH = /^\/(property|properties)\/[^/]+\/?$/;

/** True when the pathname is a single-property detail route (canonical or legacy). */
export function isPropertyDetailPath(pathname: string): boolean {
  return PROPERTY_DETAIL_PATH.test(pathname.replace(/\/+$/, '') || '/');
}

/** Absolute canonical URL for a property detail page — always the singular route. */
export function propertyCanonicalUrl(id: string): string {
  return `${SITE_ORIGIN}/property/${id}`;
}

/** Absolute URL for any in-app path, normalized (no trailing slash, no query/hash). */
export function absoluteUrl(pathname: string): string {
  const clean = (pathname.split(/[?#]/)[0] || '/').replace(/\/+$/, '');
  return `${SITE_ORIGIN}${clean === '' ? '/' : clean}`;
}

/** Site-wide fallback social preview image (absolute URL). */
export const DEFAULT_SOCIAL_IMAGE = `${SITE_ORIGIN}/icon-512.png`;

/**
 * Resolve a property photo into an absolute https URL usable by social crawlers.
 * Returns the site-wide fallback when the candidate is missing, relative to a
 * blob/data source, or otherwise unusable.
 */
export function socialImageUrl(candidate?: string | null): string {
  const raw = (candidate || '').trim();
  if (!raw) return DEFAULT_SOCIAL_IMAGE;
  if (raw.startsWith('blob:') || raw.startsWith('data:')) return DEFAULT_SOCIAL_IMAGE;
  if (raw.startsWith('https://')) return raw;
  if (raw.startsWith('http://')) return raw.replace(/^http:\/\//, 'https://');
  if (raw.startsWith('//')) return `https:${raw}`;
  if (raw.startsWith('/')) return `${SITE_ORIGIN}${raw}`;
  return DEFAULT_SOCIAL_IMAGE;
}
