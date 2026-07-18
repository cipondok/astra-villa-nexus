#!/usr/bin/env node
/**
 * ASTRA Villa — Deterministic marketplace E2E seed.
 *
 * Inserts a fixed set of 30 `properties` rows tagged with a unique title marker
 * (`E2E_MARKETPLACE`) so E2E specs can isolate them via `?q=E2E_MARKETPLACE`.
 *
 * Rows use hard-coded UUIDs so the seed is idempotent (upsert on id) and the
 * teardown can delete precisely the rows this script created — nothing else.
 *
 * Requires the Supabase service role key to bypass RLS. Reads env vars in this
 * order (first hit wins):
 *   SUPABASE_URL              | VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY | SUPABASE_SERVICE_KEY
 *
 * CLI:
 *   node scripts/seed-e2e-marketplace.mjs           # seed (upsert)
 *   node scripts/seed-e2e-marketplace.mjs --clean   # remove seeded rows
 */

import { createClient } from "@supabase/supabase-js";

export const SEED_MARKER = "E2E_MARKETPLACE";
export const SEED_COUNT = 30;

const CITIES = ["Bali", "Jakarta", "Bandung", "Surabaya", "Yogyakarta"];
const TYPES = ["villa", "apartment", "house", "villa", "villa"]; // villa-heavy
const LISTING = ["sale", "sale", "rent", "sale", "rent"];

/** Deterministic UUID v4 (variant `a`) — `e2e00000-0000-4000-a000-0000000000NN`. */
function seedId(i) {
  const nn = String(i).padStart(2, "0");
  return `e2e00000-0000-4000-a000-00000000${nn.padStart(4, "0")}`;
}

export function buildSeedRows() {
  const rows = [];
  for (let i = 1; i <= SEED_COUNT; i++) {
    const city = CITIES[i % CITIES.length];
    const type = TYPES[i % TYPES.length];
    const listing_type = LISTING[i % LISTING.length];
    const price = 1_000_000 * (100 + i); // 101M .. 130M, strictly ascending
    const price_idr = price;
    rows.push({
      id: seedId(i),
      title: `${SEED_MARKER} Villa ${String(i).padStart(2, "0")}`,
      slug: `e2e-marketplace-villa-${String(i).padStart(2, "0")}`,
      description: `Deterministic E2E fixture #${i}. Do not edit — managed by scripts/seed-e2e-marketplace.mjs.`,
      city,
      area: city,
      location: city,
      address: `${i} Test Lane, ${city}`,
      price,
      price_idr,
      listing_type,
      property_type: type,
      bedrooms: 2 + (i % 4),
      bathrooms: 1 + (i % 3),
      land_sqm: 100 + i * 5,
      building_sqm: 80 + i * 4,
      area_sqm: 80 + i * 4,
      status: "active",
      approval_status: "approved",
      featured: i <= 3,
      investment_score: 60 + (i % 40),
      rental_yield_percentage: 4 + ((i % 8) * 0.25),
      images: [],
      image_urls: [],
      meta: { source: "e2e-seed", marker: SEED_MARKER, index: i },
      // Backdate so seeded rows land at the START of `newest` sort. This keeps
      // the seed from displacing real listings in production sort order, but
      // still makes them visible via the `?q=E2E_MARKETPLACE` filter.
      created_at: new Date(Date.UTC(2000, 0, 1, 0, 0, i)).toISOString(),
      listed_at: new Date(Date.UTC(2000, 0, 1, 0, 0, i)).toISOString(),
    });
  }
  return rows;
}

function readEnv() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    "";
  return { url, key };
}

export function getServiceClient() {
  const { url, key } = readEnv();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function seed({ log = console.log } = {}) {
  const client = getServiceClient();
  if (!client) {
    log(
      "[seed:e2e] SUPABASE_SERVICE_ROLE_KEY not set — skipping deterministic seed. " +
        "Specs will fall back to skip-when-empty behavior.",
    );
    return { skipped: true, inserted: 0 };
  }
  const rows = buildSeedRows();
  // Chunked upsert to stay within request limits.
  const CHUNK = 20;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const { error, count } = await client
      .from("properties")
      .upsert(slice, { onConflict: "id", count: "exact" });
    if (error) {
      throw new Error(`[seed:e2e] upsert failed at chunk ${i / CHUNK}: ${error.message}`);
    }
    inserted += count ?? slice.length;
  }
  log(`[seed:e2e] Upserted ${inserted}/${rows.length} deterministic marketplace rows.`);
  return { skipped: false, inserted };
}

export async function cleanup({ log = console.log } = {}) {
  const client = getServiceClient();
  if (!client) {
    log("[seed:e2e] SUPABASE_SERVICE_ROLE_KEY not set — skipping cleanup.");
    return { skipped: true, deleted: 0 };
  }
  const ids = Array.from({ length: SEED_COUNT }, (_, i) => seedId(i + 1));
  const { error, count } = await client
    .from("properties")
    .delete({ count: "exact" })
    .in("id", ids);
  if (error) throw new Error(`[seed:e2e] cleanup failed: ${error.message}`);
  log(`[seed:e2e] Deleted ${count ?? 0} seeded marketplace rows.`);
  return { skipped: false, deleted: count ?? 0 };
}

// --- CLI ---
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const mode = process.argv.includes("--clean") ? "clean" : "seed";
  (mode === "clean" ? cleanup() : seed())
    .then((r) => {
      if (r.skipped) process.exit(0);
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
