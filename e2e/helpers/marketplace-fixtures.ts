/**
 * Shared constants for the marketplace E2E fixtures produced by
 * `scripts/seed-e2e-marketplace.mjs`. Keep in sync with that script.
 */
export const MARKETPLACE_SEED_MARKER = "E2E_MARKETPLACE";
export const MARKETPLACE_SEED_COUNT = 30;

/** URL query string that isolates E2E fixture rows in the /properties view. */
export const MARKETPLACE_SEED_QUERY = `?q=${MARKETPLACE_SEED_MARKER}`;
