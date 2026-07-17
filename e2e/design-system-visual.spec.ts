import { test, expect, Page } from '@playwright/test';

/**
 * ASTRA Villa — Design System Visual Regression
 *
 * Locks the visual contract for the three canonical property surfaces:
 *   1. Homepage             (/)
 *   2. Property Marketplace (/properties)
 *   3. Property Detail      (first card from marketplace)
 *
 * Purpose: catch future UI token drift and spacing regressions caused by
 * hardcoded colors, legacy theme reintroduction, or padding/typography changes.
 *
 * Baselines are stored per-viewport and per-theme so cross-breakpoint
 * regressions are visible independently.
 *
 * To refresh baselines intentionally:
 *   UPDATE_SNAPSHOTS=true npx playwright test e2e/design-system-visual.spec.ts
 */

type ViewportSpec = { name: 'mobile' | 'tablet' | 'desktop'; width: number; height: number };

const VIEWPORTS: ViewportSpec[] = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'desktop', width: 1440, height: 900 },
];

const THEMES = ['light', 'dark'] as const;
type Theme = (typeof THEMES)[number];

/**
 * Stabilize the page for pixel-diffing:
 * - Force theme via `html` class + localStorage (matches ThemeProvider)
 * - Suppress animations, transitions, and caret blink
 * - Neutralize media (blur images/video) so CDN churn does not flake tests
 * - Wait for fonts and network idle
 */
async function stabilize(page: Page, theme: Theme) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        caret-color: transparent !important;
      }
      html { scroll-behavior: auto !important; }
      img, video, canvas, [style*="background-image"] {
        filter: blur(6px) saturate(0) !important;
      }
    `,
  });

  await page.evaluate((t) => {
    try {
      localStorage.setItem('astra-theme', t);
      localStorage.setItem('theme', t);
      localStorage.setItem('vite-ui-theme', t);
    } catch {}
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(t);
    root.style.colorScheme = t;
  }, theme);

  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(300);
}

async function snapshotFullPage(page: Page, name: string) {
  await expect(page).toHaveScreenshot(name, {
    fullPage: true,
    animations: 'disabled',
    // Design tokens should be stable; allow a small tolerance for AA rendering.
    maxDiffPixels: 400,
    threshold: 0.25,
  });
}

test.describe('Design system visual regression', () => {
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      test.describe(`${vp.name} · ${theme}`, () => {
        test.beforeEach(async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });
        });

        test('homepage matches baseline', async ({ page }) => {
          await page.goto('/', { waitUntil: 'domcontentloaded' });
          await stabilize(page, theme);
          await snapshotFullPage(page, `home-${vp.name}-${theme}.png`);
        });

        test('property marketplace matches baseline', async ({ page }) => {
          await page.goto('/properties', { waitUntil: 'domcontentloaded' });
          await stabilize(page, theme);
          // Wait for at least one property card / list item to render.
          await page
            .locator('[data-testid="property-card"], article, a[href*="/property/"]')
            .first()
            .waitFor({ state: 'visible', timeout: 15_000 })
            .catch(() => {});
          await snapshotFullPage(page, `marketplace-${vp.name}-${theme}.png`);
        });

        test('property detail matches baseline', async ({ page }) => {
          await page.goto('/properties', { waitUntil: 'domcontentloaded' });
          const firstLink = page.locator('a[href*="/property/"]').first();
          const hasCard = await firstLink
            .waitFor({ state: 'visible', timeout: 15_000 })
            .then(() => true)
            .catch(() => false);
          test.skip(!hasCard, 'No property cards available to open a detail page');

          await Promise.all([
            page.waitForURL(/\/property\//, { timeout: 15_000 }).catch(() => {}),
            firstLink.click(),
          ]);
          await stabilize(page, theme);
          await snapshotFullPage(page, `property-detail-${vp.name}-${theme}.png`);
        });
      });
    }
  }
});
