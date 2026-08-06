/**
 * Shared constants for the marketplace E2E fixtures produced by
 * `scripts/seed-e2e-marketplace.mjs`. Keep in sync with that script.
 */
export const MARKETPLACE_SEED_MARKER = "E2E_MARKETPLACE";
export const MARKETPLACE_SEED_COUNT = 30;

/** URL query string that isolates E2E fixture rows in the /properties view. */
export const MARKETPLACE_SEED_QUERY = `?q=${MARKETPLACE_SEED_MARKER}`;

/** Deterministic fixture UUID for row `i` (1-based). Mirrors the seed script. */
export function marketplaceSeedId(i: number): string {
  const nn = String(i).padStart(2, "0");
  return `e2e00000-0000-4000-a000-00000000${nn.padStart(4, "0")}`;
}

