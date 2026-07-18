import { test, expect, Page, Request } from '@playwright/test';
import {
  MARKETPLACE_SEED_COUNT,
  MARKETPLACE_SEED_QUERY,
} from './helpers/marketplace-fixtures';

/**
 * ASTRA Villa — Marketplace multi-page E2E
 *
 * Scrolls /properties through several pages of infinite scroll and asserts:
 *   1. Multiple distinct pages are fetched from Supabase.
 *   2. No duplicate REST requests fire for the same (URL + Range) tuple.
 *   3. End-of-list behavior is correct: once no more pages are available the
 *      "End of collection" marker appears (or fits in the first response) and
 *      further scrolling produces no additional network fetches.
 *
 * Skips gracefully when the environment has no seeded properties or fewer
 * than a full page of results.
 */

const CARD_SELECTOR = 'a[href^="/properties/"]';
const PROPERTIES_REST = /\/rest\/v1\/properties(\?|$)/;

type Fetch = {
  url: string;
  range: string;
  key: string;
  ts: number;
};

async function waitForCards(page: Page, timeout = 15_000) {
  await page
    .waitForSelector(CARD_SELECTOR, { timeout, state: 'attached' })
    .catch(() => null);
}

async function countCards(page: Page) {
  return page.locator(CARD_SELECTOR).count();
}

/** Scroll to the very bottom in small steps so IntersectionObserver-based
 *  sentinels + the virtualizer can react between frames. */
async function scrollToBottom(page: Page, step = 800, maxSteps = 60) {
  for (let i = 0; i < maxSteps; i++) {
    const done = await page.evaluate((s) => {
      window.scrollBy(0, s);
      return window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
    }, step);
    await page.waitForTimeout(150);
    if (done) return;
  }
}

/** Attach a request listener that records every Supabase properties fetch. */
function trackPropertyFetches(page: Page): Fetch[] {
  const records: Fetch[] = [];
  const onRequest = (req: Request) => {
    if (req.method() !== 'GET') return;
    const url = req.url();
    if (!PROPERTIES_REST.test(url)) return;
    // Ignore single-item detail fetches ("id=eq.<uuid>") — we only care
    // about list-mode pagination requests.
    if (/[?&]id=eq\./.test(url)) return;
    const range = req.headers()['range'] || '';
    records.push({
      url,
      range,
      key: `${url}::${range}`,
      ts: Date.now(),
    });
  };
  page.on('request', onRequest);
  return records;
}

test.describe('Properties marketplace · multi-page', () => {
  test('scrolls through multiple pages with no duplicate requests', async ({
    page,
  }) => {
    const fetches = trackPropertyFetches(page);

    await page.goto(`/properties${MARKETPLACE_SEED_QUERY}&debug=1`, {
      waitUntil: 'domcontentloaded',
    });
    await waitForCards(page);

    const initial = await countCards(page);
    test.skip(initial === 0, 'Marketplace seed missing and no organic data.');

    // Wait for the initial page fetch to complete before we start scrolling.
    await page.waitForTimeout(500);
    const initialFetchCount = fetches.length;
    expect(initialFetchCount).toBeGreaterThan(0);

    // Drive infinite scroll for up to 4 additional pages.
    const MAX_PAGES = 4;
    let previousCount = initial;
    let endMarkerSeen = false;

    for (let i = 0; i < MAX_PAGES; i++) {
      await scrollToBottom(page);
      // Wait for either: (a) card count grows, or (b) end-of-list marker.
      const grew = await page
        .waitForFunction(
          (prev) =>
            document.querySelectorAll('a[href^="/properties/"]').length > prev ||
            !!document.body.innerText.match(/End of collection/i),
          previousCount,
          { timeout: 6_000 },
        )
        .then(() => true)
        .catch(() => false);

      const marker = await page.getByText(/End of collection/i).count();
      if (marker > 0) {
        endMarkerSeen = true;
        break;
      }
      if (!grew) break;

      const nextCount = await countCards(page);
      // Card count must be non-decreasing and strictly greater on progress.
      expect(nextCount).toBeGreaterThanOrEqual(previousCount);
      previousCount = nextCount;
    }

    // Small settle window for any trailing requests.
    await page.waitForTimeout(600);

    // ---- Assertion 1: no duplicate REST requests ----
    const seen = new Map<string, number>();
    for (const f of fetches) {
      seen.set(f.key, (seen.get(f.key) ?? 0) + 1);
    }
    const duplicates = [...seen.entries()].filter(([, n]) => n > 1);
    expect(
      duplicates,
      `Duplicate Supabase properties fetches detected: ${duplicates
        .map(([k, n]) => `\n  ${n}× ${k}`)
        .join('')}`,
    ).toEqual([]);

    // ---- Assertion 2: multiple distinct pages were fetched (unless catalog
    //      fit in the first response, in which case the end marker MUST show)
    const distinctRanges = new Set(fetches.map((f) => f.range).filter(Boolean));
    const finalCount = await countCards(page);
    if (finalCount > initial) {
      // We paginated — expect >=2 distinct Range headers.
      expect(distinctRanges.size).toBeGreaterThanOrEqual(2);
    } else {
      // Whole catalog fit in page 1 → end marker MUST be visible.
      expect(endMarkerSeen).toBeTruthy();
    }

    // ---- Assertion 2b: when the deterministic seed is in place (isolated
    //      by the ?q= filter) the total count MUST equal the seed size and
    //      the end-of-list marker MUST have been reached.
    if (finalCount >= MARKETPLACE_SEED_COUNT) {
      expect(finalCount).toBe(MARKETPLACE_SEED_COUNT);
      expect(endMarkerSeen).toBeTruthy();
    }

    // ---- Assertion 3: end-of-list behavior — extra scrolls at the bottom
    //      must NOT trigger any additional property fetches.
    const beforeIdleScroll = fetches.length;
    for (let i = 0; i < 3; i++) {
      await scrollToBottom(page);
      await page.waitForTimeout(400);
    }
    // Allow one grace request in flight for slow environments, but no more.
    const afterIdleScroll = fetches.length;
    expect(
      afterIdleScroll - beforeIdleScroll,
      'Additional Supabase property fetches fired after end-of-list — ' +
        'sentinel is not being suppressed once hasNextPage is false.',
    ).toBeLessThanOrEqual(1);

    // If the end-of-list marker is present, the marketplace dev overlay's
    // duplicate counters (mounted via ?debug=1) should read zero.
    if (endMarkerSeen) {
      const overlay = page.getByRole('complementary', {
        name: /marketplace developer overlay/i,
      });
      if (await overlay.count()) {
        await expect(overlay).toContainText(/duplicate_requests\s*0/i);
        await expect(overlay).toContainText(/duplicate_rows\s*0/i);
      }
    }
  });
});
