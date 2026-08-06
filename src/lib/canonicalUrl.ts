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
