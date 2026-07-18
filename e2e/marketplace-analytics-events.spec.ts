import { test, expect, Page, Request } from '@playwright/test';
import {
  MARKETPLACE_SEED_COUNT,
  MARKETPLACE_SEED_QUERY,
} from './helpers/marketplace-fixtures';

/**
 * ASTRA Villa — Marketplace analytics events E2E
 *
 * Intercepts the `track-behavior` edge function calls emitted by
 * `useTrackEvent` while paginating /properties and asserts:
 *
 *   1. `marketplace_fetch_start` and `marketplace_batch_loaded` fire for
 *      every page loaded (matching page_index, no dupes).
 *   2. `marketplace_next_page_trigger` fires at least once when more pages
 *      are available.
 *   3. `marketplace_end_of_list` fires exactly once when the catalog is
 *      exhausted.
 *   4. NO `marketplace_duplicate_request_detected` events are emitted.
 *   5. NO duplicate `marketplace_batch_loaded` events for the same
 *      page_index within one filter session.
 */

const CARD_SELECTOR = 'a[href^="/properties/"]';
const TRACK_URL = /\/functions\/v1\/track-behavior(\?|$)/;

type TrackedEvent = {
  event_type: string;
  metadata?: Record<string, any>;
  property_id?: string;
  city?: string;
  value?: number;
};

async function waitForCards(page: Page, timeout = 15_000) {
  await page
    .waitForSelector(CARD_SELECTOR, { timeout, state: 'attached' })
    .catch(() => null);
}

async function countCards(page: Page) {
  return page.locator(CARD_SELECTOR).count();
}

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

/** Capture every event posted to track-behavior. Body is JSON of the form
 *  `{ events: TrackedEvent[], session_id: string }`. */
function captureAnalytics(page: Page): TrackedEvent[] {
  const collected: TrackedEvent[] = [];
  const onRequest = (req: Request) => {
    if (req.method() !== 'POST') return;
    if (!TRACK_URL.test(req.url())) return;
    const raw = req.postData();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const events = Array.isArray(parsed?.events) ? parsed.events : [];
      for (const ev of events) {
        if (ev && typeof ev.event_type === 'string') collected.push(ev);
      }
    } catch {
      // ignore non-JSON bodies
    }
  };
  page.on('request', onRequest);
  return collected;
}

function byType(events: TrackedEvent[], type: string) {
  return events.filter((e) => e.event_type === type);
}

test.describe('Properties marketplace · analytics events', () => {
  test('emits expected paging events and never duplicates them', async ({
    page,
  }) => {
    const analytics = captureAnalytics(page);

    await page.goto(`/properties${MARKETPLACE_SEED_QUERY}`, {
      waitUntil: 'domcontentloaded',
    });
    await waitForCards(page);

    const initial = await countCards(page);
    test.skip(initial === 0, 'Marketplace seed missing and no organic data.');

    // Drive infinite scroll to the end.
    const MAX_PAGES = 6;
    let previousCount = initial;
    let endMarkerSeen = false;
    for (let i = 0; i < MAX_PAGES; i++) {
      await scrollToBottom(page);
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

      if ((await page.getByText(/End of collection/i).count()) > 0) {
        endMarkerSeen = true;
        break;
      }
      if (!grew) break;
      previousCount = await countCards(page);
    }

    // Flush interval is 5s and unmount also flushes — give the buffer time,
    // then trigger an explicit flush by navigating away.
    await page.waitForTimeout(5_500);
    await page.goto('about:blank', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    // ---- Assertion 0: never any client-side duplicate REST detection ----
    const dupEvents = byType(analytics, 'marketplace_duplicate_request_detected');
    expect(
      dupEvents,
      `Client detected duplicate REST requests: ${JSON.stringify(dupEvents)}`,
    ).toEqual([]);

    // ---- Assertion 1: fetch_start + batch_loaded pair per page_index ----
    const starts = byType(analytics, 'marketplace_fetch_start');
    const loaded = byType(analytics, 'marketplace_batch_loaded');
    expect(starts.length).toBeGreaterThan(0);
    expect(loaded.length).toBeGreaterThan(0);

    const loadedIndices = loaded
      .map((e) => e.metadata?.page_index)
      .filter((v): v is number => typeof v === 'number');
    const uniqueLoadedIndices = new Set(loadedIndices);
    expect(
      uniqueLoadedIndices.size,
      `Duplicate marketplace_batch_loaded page_index detected: ${loadedIndices.join(', ')}`,
    ).toBe(loadedIndices.length);

    // Indices must be contiguous starting from 0.
    const sortedIdx = [...uniqueLoadedIndices].sort((a, b) => a - b);
    sortedIdx.forEach((idx, i) => expect(idx).toBe(i));

    // ---- Assertion 2: next_page_trigger fires when we paginated ----
    const finalCount = await countCards(page).catch(() => 0);
    // countCards() runs on about:blank — use loaded page_indices as proxy.
    const paginated = uniqueLoadedIndices.size > 1;
    if (paginated) {
      const triggers = byType(analytics, 'marketplace_next_page_trigger');
      expect(
        triggers.length,
        'Expected at least one marketplace_next_page_trigger event ' +
          'when the sentinel drives pagination.',
      ).toBeGreaterThanOrEqual(1);
    }

    // ---- Assertion 3: end_of_list fires exactly once when we reached it ----
    if (endMarkerSeen || uniqueLoadedIndices.size >= Math.ceil(MARKETPLACE_SEED_COUNT / 12)) {
      const ends = byType(analytics, 'marketplace_end_of_list');
      expect(
        ends.length,
        `Expected marketplace_end_of_list to fire exactly once, got ${ends.length}.`,
      ).toBe(1);
    }

    // ---- Assertion 4: no accidental duplicate fetch_start for same index --
    const startIndices = starts
      .map((e) => e.metadata?.page_index)
      .filter((v): v is number => typeof v === 'number');
    const startCounts = new Map<number, number>();
    for (const idx of startIndices) startCounts.set(idx, (startCounts.get(idx) ?? 0) + 1);
    const dupStarts = [...startCounts.entries()].filter(([, n]) => n > 1);
    expect(
      dupStarts,
      `Duplicate marketplace_fetch_start events: ${dupStarts
        .map(([k, n]) => `page_index=${k} ×${n}`)
        .join(', ')}`,
    ).toEqual([]);
  });
});
