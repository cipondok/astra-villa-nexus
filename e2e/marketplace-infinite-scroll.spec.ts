import { test, expect, Page } from '@playwright/test';
import { MARKETPLACE_SEED_QUERY } from './helpers/marketplace-fixtures';

/**
 * ASTRA Villa — Marketplace E2E
 *
 * Verifies /properties for:
 *   1. Server-side infinite scroll (initial page + subsequent page loads via sentinel).
 *   2. Filter & sort URL persistence across navigation.
 *   3. Scroll-position restoration when returning from a property detail page.
 *
 * The tests are resilient to sparse dev data: when the DB contains fewer than
 * one full page they log and short-circuit instead of failing hard, so this
 * file is safe to run against seeded and empty environments alike.
 */

const CARD_SELECTOR = 'a[href^="/properties/"]';

async function waitForCards(page: Page, timeout = 15_000) {
  await page.waitForSelector(CARD_SELECTOR, { timeout, state: 'attached' }).catch(() => null);
}

async function countCards(page: Page) {
  return page.locator(CARD_SELECTOR).count();
}

/** Scroll the window in incremental steps so IntersectionObserver-based
 *  sentinels & virtualization can react between frames. */
async function scrollToBottom(page: Page, step = 800, maxSteps = 40) {
  for (let i = 0; i < maxSteps; i++) {
    const done = await page.evaluate((s) => {
      window.scrollBy(0, s);
      return window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
    }, step);
    await page.waitForTimeout(120);
    if (done) return;
  }
}

test.describe('Properties marketplace', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/properties', { waitUntil: 'domcontentloaded' });
    await waitForCards(page);
  });

  test('infinite scroll loads additional pages without duplicates', async ({ page }) => {
    const initial = await countCards(page);
    test.skip(initial === 0, 'No properties seeded in this environment.');

    // Scroll to trigger the sentinel + fetchNextPage.
    await scrollToBottom(page);

    // Give the network + virtualizer up to 6s to append.
    await page.waitForFunction(
      (start) => document.querySelectorAll('a[href^="/properties/"]').length > start,
      initial,
      { timeout: 6_000 },
    ).catch(() => null);

    // Do a second scroll pass to allow at least one more page or end-marker.
    await scrollToBottom(page);
    await page.waitForTimeout(500);

    const after = await countCards(page);

    // Either more results loaded, OR the end-of-list marker appeared
    // (meaning the entire catalog fit in the first response).
    const endMarker = page.getByText(/End of collection/i);
    const endVisible = await endMarker.count();

    expect(after >= initial).toBeTruthy();
    if (after === initial) {
      expect(endVisible).toBeGreaterThan(0);
    }

    // No duplicate hrefs — the dedupe layer must hold.
    const hrefs = await page.locator(CARD_SELECTOR).evaluateAll((els) =>
      els.map((e) => (e as HTMLAnchorElement).getAttribute('href') || ''),
    );
    const unique = new Set(hrefs);
    expect(unique.size).toBe(hrefs.length);
  });

  test('sort selection persists in URL and after back-navigation', async ({ page }) => {
    const initial = await countCards(page);
    test.skip(initial === 0, 'No properties seeded in this environment.');

    const sortSelect = page.getByLabel('Sort properties');
    await expect(sortSelect).toBeVisible();

    // Pick a non-default sort option.
    await sortSelect.selectOption('price-asc').catch(async () => {
      // Fallback: pick any option that isn't the current one.
      const values = await sortSelect.locator('option').evaluateAll(
        (opts) => opts.map((o) => (o as HTMLOptionElement).value),
      );
      const target = values.find((v) => v && v !== 'newest') ?? values[0];
      await sortSelect.selectOption(target);
    });

    await page.waitForURL(/[?&]sort=/, { timeout: 5_000 });
    const sortedUrl = page.url();
    expect(sortedUrl).toMatch(/sort=/);

    // Also apply a search query via the search input.
    const searchInput = page.getByLabel('Search properties');
    await searchInput.fill('villa');
    await searchInput.press('Enter');
    await page.waitForURL(/[?&]q=villa/i, { timeout: 5_000 });

    const composedUrl = page.url();

    // Navigate to a detail page then back — filters must survive.
    const firstCard = page.locator(CARD_SELECTOR).first();
    await firstCard.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => null);

    if (await firstCard.count()) {
      await firstCard.click();
      await page.waitForURL(/\/properties\/[^/?#]+/, { timeout: 8_000 });
      await page.goBack();
      await page.waitForURL(/\/properties(\?.*)?$/, { timeout: 8_000 });
    } else {
      // No results for this query — still verify reload preserves URL state.
      await page.reload();
    }

    expect(page.url()).toBe(composedUrl);

    // The sort <select> should still reflect the persisted value.
    const persistedSort = await page.getByLabel('Sort properties').inputValue();
    expect(persistedSort).not.toBe('newest');
  });

  test('scroll position restores after returning from a property detail', async ({ page }) => {
    const initial = await countCards(page);
    test.skip(initial < 4, 'Need at least a few cards to exercise scroll restoration.');

    // Scroll a meaningful distance down the grid.
    await page.evaluate(() => window.scrollTo(0, 0));
    await scrollToBottom(page, 600, 6); // partial scroll — not all the way
    const beforeScroll = await page.evaluate(() => window.scrollY);
    expect(beforeScroll).toBeGreaterThan(200);

    // Click a card that is currently within the viewport.
    const cards = page.locator(CARD_SELECTOR);
    const count = await cards.count();
    let clicked = false;
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const inView = await card.evaluate((el) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        return r.top >= 0 && r.bottom <= window.innerHeight;
      }).catch(() => false);
      if (inView) {
        await card.click();
        clicked = true;
        break;
      }
    }
    test.skip(!clicked, 'No in-viewport card was clickable.');

    await page.waitForURL(/\/properties\/[^/?#]+/, { timeout: 8_000 });

    await page.goBack();
    await page.waitForURL(/\/properties(\?.*)?$/, { timeout: 8_000 });
    await waitForCards(page);

    // Allow useScrollRestore + virtualizer a moment to settle.
    await page.waitForTimeout(600);
    const afterScroll = await page.evaluate(() => window.scrollY);

    // Accept a ±150px tolerance to account for virtualization row measurement.
    expect(Math.abs(afterScroll - beforeScroll)).toBeLessThan(150);
  });
});
