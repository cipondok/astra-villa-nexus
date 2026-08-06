/**
 * ASTRA Villa — Canonical property route E2E suite.
 *
 * Guards the `/property/:id` URL contract:
 *  1. Every property card / feed link rendered anywhere in the app must point
 *     at the singular `/property/:id` route (never the legacy plural form).
 *  2. Legacy `/properties/:id` links must redirect to `/property/:id` with
 *     search params preserved and must never render the 404 page.
 */
import { test, expect, type Page } from '@playwright/test';
import { MARKETPLACE_SEED_QUERY, marketplaceSeedId } from './helpers/marketplace-fixtures';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:8080';
const SEED_ID = marketplaceSeedId(1);

/** Matches a detail link on the legacy plural route: /properties/<id> */
const LEGACY_DETAIL_RE = /^\/properties\/[^/?#]+/;
/** Matches the canonical detail route: /property/<id> */
const CANONICAL_DETAIL_RE = /^\/property\/[^/?#]+/;

async function gotoAndSettle(page: Page, path: string) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
}

/** All in-app anchor pathnames currently rendered on the page. */
async function collectPropertyLinks(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
      .map((a) => {
        try {
          const url = new URL(a.getAttribute('href')!, window.location.origin);
          return url.origin === window.location.origin ? url.pathname : '';
        } catch {
          return '';
        }
      })
      .filter((p) => p.startsWith('/property/') || p.startsWith('/properties/')),
  );
}

async function expectNoNotFoundPage(page: Page) {
  await expect(page.getByText(/page not found/i)).toHaveCount(0);
  await expect(page.getByText(/^404$/)).toHaveCount(0);
}

test.describe('Canonical property routes — link hygiene', () => {
  const surfaces = ['/', `/properties${MARKETPLACE_SEED_QUERY}`];

  for (const path of surfaces) {
    test(`no legacy /properties/:id links on ${path}`, async ({ page }) => {
      await gotoAndSettle(page, path);
      // Let lazy card lists render.
      await page.waitForTimeout(1500);

      const links = await collectPropertyLinks(page);
      const legacy = links.filter(
        (href) => LEGACY_DETAIL_RE.test(href) && !CANONICAL_DETAIL_RE.test(href),
      );

      expect(
        legacy,
        `Found legacy plural detail links on ${path}: ${legacy.join(', ')}`,
      ).toEqual([]);
    });
  }

  test('marketplace cards link to /property/:id', async ({ page }) => {
    await gotoAndSettle(page, `/properties${MARKETPLACE_SEED_QUERY}`);
    await page.waitForTimeout(2000);

    const links = await collectPropertyLinks(page);
    const canonical = links.filter((href) => CANONICAL_DETAIL_RE.test(href));

    // At least one property card must be present and canonical.
    expect(canonical.length).toBeGreaterThan(0);
    for (const href of canonical) {
      expect(href).toMatch(/^\/property\/[^/]+$/);
    }
  });

  test('clicking a marketplace card navigates to /property/:id', async ({ page }) => {
    await gotoAndSettle(page, `/properties${MARKETPLACE_SEED_QUERY}`);
    await page.waitForTimeout(2000);

    const card = page.locator('a[href^="/property/"]').first();
    if ((await card.count()) === 0) test.skip(true, 'No property cards rendered');

    await card.click();
    await expect(page).toHaveURL(/\/property\/[^/?#]+/);
    await expectNoNotFoundPage(page);
  });
});

test.describe('Canonical property routes — legacy redirect', () => {
  test('/properties/:id redirects to /property/:id without a 404', async ({ page }) => {
    await gotoAndSettle(page, `/properties/${SEED_ID}`);

    await expect(page).toHaveURL(new RegExp(`/property/${SEED_ID}`));
    await expectNoNotFoundPage(page);
  });

  test('legacy redirect preserves search params', async ({ page }) => {
    await gotoAndSettle(page, `/properties/${SEED_ID}?ref=email&utm_source=test`);

    await expect(page).toHaveURL(new RegExp(`/property/${SEED_ID}\\?.*ref=email`));
    await expect(page).toHaveURL(/utm_source=test/);
    await expectNoNotFoundPage(page);
  });

  test('legacy redirect works for unknown ids (detail page, not 404 route)', async ({ page }) => {
    const unknown = '00000000-0000-4000-a000-0000000000ff';
    await gotoAndSettle(page, `/properties/${unknown}`);

    // The router must still hand off to the detail page rather than NotFound.
    await expect(page).toHaveURL(new RegExp(`/property/${unknown}`));
    await expect(page.getByText(/page not found/i)).toHaveCount(0);
  });

  test('the marketplace list route itself is unaffected', async ({ page }) => {
    await gotoAndSettle(page, '/properties');
    await expect(page).toHaveURL(/\/properties(\?|$)/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
