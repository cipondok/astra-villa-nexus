import type { FullConfig } from "@playwright/test";
// @ts-expect-error — .mjs sibling script, resolved at runtime by Node/Playwright.
import { seed } from "../scripts/seed-e2e-marketplace.mjs";

/**
 * Playwright global setup — seeds deterministic marketplace fixtures before
 * any spec runs. No-ops (and lets specs fall back to skip-when-empty) when the
 * Supabase service role key is not present in the environment.
 */
export default async function globalSetup(_config: FullConfig) {
  if (process.env.SKIP_E2E_SEED === "1") {
    console.log("[e2e] SKIP_E2E_SEED=1 — skipping marketplace seed.");
    return;
  }
  try {
    await seed();
  } catch (err) {
    console.error("[e2e] seed failed:", err);
    // Do not fail the entire suite — let each spec self-skip if data is missing.
  }
}
