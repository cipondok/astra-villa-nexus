/**
 * ASTRA Villa — Property detail canonical / social URL E2E suite.
 *
 * Guards the head-tag contract for `/property/:id`:
 *  1. `<link rel="canonical">` and `og:url` resolve to the absolute canonical
 *     singular URL `https://astravilla.com/property/<id>`.
 *  2. Twitter card tags are present and consistent with the OG tags.
 *  3. Arriving through the legacy `/properties/:id` redirect produces exactly
 *     one canonical link, pointing at the same singular URL.
 */
import { test, expect, type Page } from '@playwright/test';
import { marketplaceSeedId } from './helpers/marketplace-fixtures';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:8080';
const SITE_ORIGIN = 'https://astravilla.com';
const SEED_ID = marketplaceSeedId(1);
const EXPECTED_CANONICAL = `${SITE_ORIGIN}/property/${SEED_ID}`;

async function gotoDetail(page: Page, path: string) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  // SEOHead writes tags in an effect after the property query resolves.
  await page
    .waitForFunction(
      (expected) =>
        document.querySelector('link[rel="canonical"]')?.getAttribute('href') === expected,
      EXPECTED_CANONICAL,
      { timeout: 15_000 },
    )
    .catch(() => {});
}

const head = {
  canonicals: (page: Page) =>
    page.evaluate(() =>
      Array.from(document.querySelectorAll('link[rel="canonical"]')).map((el) =>
        el.getAttribute('href'),
      ),
    ),
  meta: (page: Page, selector: string) =>
    page.evaluate(
      (sel) => document.querySelector(sel)?.getAttribute('content') ?? null,
      selector,
    ),
};

test.describe('PropertyDetail — canonical & social URLs', () => {
  test('canonical and og:url point at the absolute /property/:id URL', async ({ page }) => {
    await gotoDetail(page, `/property/${SEED_ID}`);

    const canonicals = await head.canonicals(page);
    expect(canonicals).toEqual([EXPECTED_CANONICAL]);

    expect(await head.meta(page, 'meta[property="og:url"]')).toBe(EXPECTED_CANONICAL);
    expect(await head.meta(page, 'meta[property="og:type"]')).toBe('product');
  });

  test('twitter card tags are present and consistent with og tags', async ({ page }) => {
    await gotoDetail(page, `/property/${SEED_ID}`);

    expect(await head.meta(page, 'meta[name="twitter:card"]')).toBe('summary_large_image');

    const ogTitle = await head.meta(page, 'meta[property="og:title"]');
    const twitterTitle = await head.meta(page, 'meta[name="twitter:title"]');
    expect(twitterTitle).toBeTruthy();
    expect(twitterTitle).toBe(ogTitle);

    const ogDesc = await head.meta(page, 'meta[property="og:description"]');
    const twitterDesc = await head.meta(page, 'meta[name="twitter:description"]');
    expect(twitterDesc).toBe(ogDesc);
  });

  test('canonical never contains the legacy plural path', async ({ page }) => {
    await gotoDetail(page, `/property/${SEED_ID}`);

    const [canonical] = await head.canonicals(page);
    expect(canonical).not.toMatch(/\/properties\//);
    expect(canonical).toMatch(new RegExp(`^${SITE_ORIGIN}/property/[^/?#]+$`));
  });

  test('legacy /properties/:id redirect emits exactly one, non-conflicting canonical', async ({
    page,
  }) => {
    await gotoDetail(page, `/properties/${SEED_ID}`);

    await expect(page).toHaveURL(new RegExp(`/property/${SEED_ID}`));

    const canonicals = await head.canonicals(page);
    expect(canonicals).toHaveLength(1);
    expect(canonicals[0]).toBe(EXPECTED_CANONICAL);
    expect(await head.meta(page, 'meta[property="og:url"]')).toBe(EXPECTED_CANONICAL);
  });

  test('query params on the legacy URL do not leak into canonical or og:url', async ({ page }) => {
    await gotoDetail(page, `/properties/${SEED_ID}?utm_source=newsletter&ref=email`);

    const canonicals = await head.canonicals(page);
    expect(canonicals).toEqual([EXPECTED_CANONICAL]);
    expect(canonicals[0]).not.toMatch(/utm_source|ref=/);
    expect(await head.meta(page, 'meta[property="og:url"]')).toBe(EXPECTED_CANONICAL);
  });
});
