import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('debug-panel-onboarding-seen', 'true');
    });
    await page.reload();
  });

  test.describe('Chat Widget', () => {
    test('should match AI chat trigger button appearance', async ({ page }) => {
      const chatButton = page.locator('button:has(svg)').filter({ has: page.locator('text=AI') }).first();
      await expect(chatButton).toBeVisible();
      
      // Wait for animations to settle
      await page.waitForTimeout(1000);
      
      await expect(chatButton).toHaveScreenshot('chat-trigger-button.png', {
        animations: 'disabled',
        maxDiffPixels: 100,
      });
    });

    test('should match chat widget with hover state', async ({ page }) => {
      const chatButton = page.locator('button:has(svg)').filter({ has: page.locator('text=AI') }).first();
      await expect(chatButton).toBeVisible();
      
      await chatButton.hover();
      await page.waitForTimeout(500); // Wait for hover transition
      
      await expect(chatButton).toHaveScreenshot('chat-trigger-button-hover.png', {
        animations: 'disabled',
        maxDiffPixels: 100,
      });
    });

    test('should match chat widget on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const chatButton = page.locator('button:has(svg)').filter({ has: page.locator('text=AI') }).first();
      await expect(chatButton).toBeVisible();
      await page.waitForTimeout(1000);
      
      await expect(chatButton).toHaveScreenshot('chat-trigger-button-mobile.png', {
        animations: 'disabled',
        maxDiffPixels: 100,
      });
    });
  });

  test.describe('Debug Panel', () => {
    test('should match closed debug panel state', async ({ page }) => {
      const settingsButton = page.locator('button[title="Animation Debug Panel"]');
      await expect(settingsButton).toBeVisible();
      
      await expect(settingsButton).toHaveScreenshot('debug-panel-closed.png', {
        animations: 'disabled',
        maxDiffPixels: 50,
      });
    });

    test('should match open debug panel with animations enabled', async ({ page }) => {
      await page.keyboard.press('Control+d');
      const panel = page.locator('text=Animation Debug').locator('..');
      await expect(panel).toBeVisible();
      await page.waitForTimeout(500);
      
      await expect(panel).toHaveScreenshot('debug-panel-open-animations-on.png', {
        animations: 'disabled',
        maxDiffPixels: 100,
      });
    });

    test('should match debug panel with manual override active', async ({ page }) => {
      await page.keyboard.press('Control+d');
      await page.keyboard.press('Control+a');
      await page.waitForTimeout(500);
      
      const panel = page.locator('text=Animation Debug').locator('..');
      await expect(panel).toBeVisible();
      
      await expect(panel).toHaveScreenshot('debug-panel-with-override.png', {
        animations: 'disabled',
        maxDiffPixels: 100,
      });
    });

    test('should match debug panel on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.keyboard.press('Control+d');
      
      const panel = page.locator('text=Animation Debug').locator('..');
      await expect(panel).toBeVisible();
      await page.waitForTimeout(500);
      
      await expect(panel).toHaveScreenshot('debug-panel-mobile.png', {
        animations: 'disabled',
        maxDiffPixels: 100,
      });
    });
  });

  test.describe('Onboarding Tooltip', () => {
    test('should match onboarding tooltip appearance', async ({ page }) => {
      // Clear localStorage to show onboarding
      await page.evaluate(() => {
        localStorage.removeItem('debug-panel-onboarding-seen');
      });
      await page.reload();
      await page.waitForTimeout(2000);
      
      const tooltip = page.locator('text=Developer Tools Available!').locator('..');
      await expect(tooltip).toBeVisible();
      
      await expect(tooltip).toHaveScreenshot('onboarding-tooltip.png', {
        animations: 'disabled',
        maxDiffPixels: 150,
      });
    });

    test('should match onboarding tooltip on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.evaluate(() => {
        localStorage.removeItem('debug-panel-onboarding-seen');
      });
      await page.reload();
      await page.waitForTimeout(2000);
      
      const tooltip = page.locator('text=Developer Tools Available!').locator('..');
      await expect(tooltip).toBeVisible();
      
      await expect(tooltip).toHaveScreenshot('onboarding-tooltip-mobile.png', {
        animations: 'disabled',
        maxDiffPixels: 150,
      });
    });
  });

  test.describe('Keyboard Shortcuts Modal', () => {
    test('should match keyboard shortcuts modal appearance', async ({ page }) => {
      await page.keyboard.press('?');
      
      const modal = page.locator('text=Keyboard Shortcuts').locator('..');
      await expect(modal).toBeVisible();
      await page.waitForTimeout(500);
      
      await expect(modal).toHaveScreenshot('keyboard-shortcuts-modal.png', {
        animations: 'disabled',
        maxDiffPixels: 150,
      });
    });

    test('should match keyboard shortcuts modal on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.keyboard.press('?');
      
      const modal = page.locator('text=Keyboard Shortcuts').locator('..');
      await expect(modal).toBeVisible();
      await page.waitForTimeout(500);
      
      await expect(modal).toHaveScreenshot('keyboard-shortcuts-modal-mobile.png', {
        animations: 'disabled',
        maxDiffPixels: 150,
      });
    });
  });

  test.describe('Full Page Layouts', () => {
    test('should match full page with all elements', async ({ page }) => {
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('full-page-default.png', {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixels: 200,
      });
    });

    test('should match full page with debug panel open', async ({ page }) => {
      await page.keyboard.press('Control+d');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('full-page-debug-panel-open.png', {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixels: 200,
      });
    });

    test('should match full page with modal open', async ({ page }) => {
      await page.keyboard.press('?');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('full-page-modal-open.png', {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixels: 200,
      });
    });

    test('should match full page on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('full-page-tablet.png', {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixels: 200,
      });
    });

    test('should match full page on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('full-page-mobile.png', {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixels: 200,
      });
    });
  });

  test.describe('Dark Mode Comparison', () => {
    test('should match chat widget in light mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.waitForTimeout(500);
      
      const chatButton = page.locator('button:has(svg)').filter({ has: page.locator('text=AI') }).first();
      await expect(chatButton).toBeVisible();
      
      await expect(chatButton).toHaveScreenshot('chat-widget-light-mode.png', {
        animations: 'disabled',
        maxDiffPixels: 100,
      });
    });

    test('should match chat widget in dark mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.waitForTimeout(500);
      
      const chatButton = page.locator('button:has(svg)').filter({ has: page.locator('text=AI') }).first();
      await expect(chatButton).toBeVisible();
      
      await expect(chatButton).toHaveScreenshot('chat-widget-dark-mode.png', {
        animations: 'disabled',
        maxDiffPixels: 100,
      });
    });

    test('should match debug panel in light mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.keyboard.press('Control+d');
      await page.waitForTimeout(500);
      
      const panel = page.locator('text=Animation Debug').locator('..');
      await expect(panel).toBeVisible();
      
      await expect(panel).toHaveScreenshot('debug-panel-light-mode.png', {
        animations: 'disabled',
        maxDiffPixels: 100,
      });
    });

    test('should match debug panel in dark mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.keyboard.press('Control+d');
      await page.waitForTimeout(500);
      
      const panel = page.locator('text=Animation Debug').locator('..');
      await expect(panel).toBeVisible();
      
      await expect(panel).toHaveScreenshot('debug-panel-dark-mode.png', {
        animations: 'disabled',
        maxDiffPixels: 100,
      });
    });
  });

  test.describe('State Transitions', () => {
    test('should match animation toggle transition', async ({ page }) => {
      await page.keyboard.press('Control+d');
      const panel = page.locator('text=Animation Debug').locator('..');
      await expect(panel).toBeVisible();
      
      // Initial state
      await page.waitForTimeout(300);
      await expect(panel).toHaveScreenshot('transition-before-toggle.png', {
        animations: 'disabled',
        maxDiffPixels: 100,
      });
      
      // Toggle animation
      await page.keyboard.press('Control+a');
      await page.waitForTimeout(500);
      
      // After toggle state
      await expect(panel).toHaveScreenshot('transition-after-toggle.png', {
        animations: 'disabled',
        maxDiffPixels: 100,
      });
    });
  });
});
