import type { FullConfig } from "@playwright/test";
// @ts-expect-error — .mjs sibling script, resolved at runtime by Node/Playwright.
import { cleanup } from "../scripts/seed-e2e-marketplace.mjs";

/**
 * Playwright global teardown — removes deterministic marketplace fixtures so
 * production/staging catalogs stay clean between CI runs.
 */
export default async function globalTeardown(_config: FullConfig) {
  if (process.env.KEEP_E2E_SEED === "1") {
    console.log("[e2e] KEEP_E2E_SEED=1 — leaving seeded rows in place.");
    return;
  }
  try {
    await cleanup();
  } catch (err) {
    console.error("[e2e] cleanup failed:", err);
  }
}
