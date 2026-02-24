import { test, expect, devices } from '@playwright/test';
import AxeBuilder from 'axe-playwright';

/**
 * Mobile Accessibility & Responsive Audits
 *
 * Tests all major pages at mobile viewport (375×812)
 * for WCAG violations, touch-target sizing, font readability,
 * viewport overflow, and interactive element accessibility.
 */

const MOBILE_PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Search', path: '/search' },
  { name: 'Properties', path: '/properties' },
  { name: 'Contact', path: '/contact' },
  { name: 'Help', path: '/help' },
  { name: 'About', path: '/about' },
  { name: 'Profile', path: '/profile' },
];

const MIN_TOUCH_TARGET = 44; // px – WCAG 2.5.8 / Google recommendation

test.describe('Mobile Accessibility Audits', () => {
  test.use({
    ...devices['iPhone 13'],
  });

  for (const page of MOBILE_PAGES) {
    test(`${page.name} – no critical WCAG violations`, async ({ page: p }) => {
      await p.goto(page.path, { waitUntil: 'networkidle' });

      const results = await new AxeBuilder({ page: p })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const critical = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      if (critical.length > 0) {
        console.log(`\n🚨 ${page.name} critical violations:`);
        critical.forEach((v) => {
          console.log(`  • ${v.id} (${v.impact}): ${v.description}`);
          console.log(`    Nodes: ${v.nodes.length}`);
        });
      }

      expect(critical).toHaveLength(0);
    });
  }
});

test.describe('Mobile Touch Target Sizing', () => {
  test.use({
    ...devices['iPhone 13'],
  });

  for (const page of MOBILE_PAGES) {
    test(`${page.name} – interactive elements meet ${MIN_TOUCH_TARGET}px minimum`, async ({
      page: p,
    }) => {
      await p.goto(page.path, { waitUntil: 'networkidle' });

      const undersizedElements = await p.evaluate((minSize) => {
        const interactiveSelectors = 'a, button, [role="button"], input, select, textarea, [role="tab"], [role="menuitem"]';
        const elements = document.querySelectorAll(interactiveSelectors);
        const problems: { tag: string; text: string; width: number; height: number }[] = [];

        elements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          // Skip hidden / off-screen elements
          if (rect.width === 0 || rect.height === 0) return;
          if (rect.top > window.innerHeight * 2) return; // far off-screen

          if (rect.width < minSize || rect.height < minSize) {
            const text = (el.textContent || '').trim().slice(0, 30);
            problems.push({
              tag: el.tagName.toLowerCase(),
              text,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            });
          }
        });

        return problems;
      }, MIN_TOUCH_TARGET);

      if (undersizedElements.length > 0) {
        console.log(`\n⚠️  ${page.name} undersized touch targets (< ${MIN_TOUCH_TARGET}px):`);
        undersizedElements.slice(0, 10).forEach((el) => {
          console.log(`  • <${el.tag}> "${el.text}" — ${el.width}×${el.height}px`);
        });
      }

      // Allow up to 5 minor violations (e.g. inline links in prose)
      expect(undersizedElements.length).toBeLessThanOrEqual(5);
    });
  }
});

test.describe('Mobile Viewport & Layout', () => {
  test.use({
    ...devices['iPhone 13'],
  });

  for (const page of MOBILE_PAGES) {
    test(`${page.name} – no horizontal overflow`, async ({ page: p }) => {
      await p.goto(page.path, { waitUntil: 'networkidle' });

      const hasOverflow = await p.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasOverflow).toBe(false);
    });

    test(`${page.name} – body font size >= 16px`, async ({ page: p }) => {
      await p.goto(page.path, { waitUntil: 'networkidle' });

      const fontSize = await p.evaluate(() => {
        const style = window.getComputedStyle(document.body);
        return parseFloat(style.fontSize);
      });

      expect(fontSize).toBeGreaterThanOrEqual(16);
    });
  }

  test('viewport meta tag is present and correct', async ({ page: p }) => {
    await p.goto('/', { waitUntil: 'networkidle' });

    const viewport = await p.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta?.getAttribute('content') || null;
    });

    expect(viewport).not.toBeNull();
    expect(viewport).toContain('width=device-width');
  });
});

test.describe('Mobile Navigation Accessibility', () => {
  test.use({
    ...devices['iPhone 13'],
  });

  test('hamburger menu is keyboard accessible', async ({ page: p }) => {
    await p.goto('/', { waitUntil: 'networkidle' });

    // Find the hamburger button
    const menuButton = p.locator('button').filter({ has: p.locator('svg') }).last();

    if (await menuButton.isVisible()) {
      // Should be focusable
      await menuButton.focus();
      const isFocused = await menuButton.evaluate(
        (el) => el === document.activeElement
      );
      expect(isFocused).toBe(true);

      // Should have accessible name
      const ariaLabel = await menuButton.getAttribute('aria-label');
      const innerText = await menuButton.innerText();
      expect(ariaLabel || innerText).toBeTruthy();
    }
  });

  test('mobile menu items are tappable', async ({ page: p }) => {
    await p.goto('/', { waitUntil: 'networkidle' });

    // Open hamburger menu
    const menuButton = p.locator('nav button').last();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await p.waitForTimeout(500);

      // Check menu items have adequate size
      const menuItems = p.locator('[role="menuitem"], nav a, nav button').filter({ hasText: /\w+/ });
      const count = await menuItems.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const box = await menuItems.nth(i).boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    }
  });
});

test.describe('Mobile Color Contrast', () => {
  test.use({
    ...devices['iPhone 13'],
  });

  for (const page of MOBILE_PAGES.slice(0, 3)) {
    test(`${page.name} – color contrast meets WCAG AA`, async ({ page: p }) => {
      await p.goto(page.path, { waitUntil: 'networkidle' });

      const results = await new AxeBuilder({ page: p })
        .withRules(['color-contrast'])
        .analyze();

      if (results.violations.length > 0) {
        console.log(`\n🎨 ${page.name} contrast issues:`);
        results.violations.forEach((v) => {
          v.nodes.forEach((n) => {
            console.log(`  • ${n.html.slice(0, 60)}...`);
            console.log(`    ${n.any?.[0]?.message || ''}`);
          });
        });
      }

      expect(results.violations).toHaveLength(0);
    });
  }
});
