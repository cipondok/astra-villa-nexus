import { test, expect } from '@playwright/test';

test.describe('Advanced Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('debug-panel-onboarding-seen', 'true');
    });
    await page.reload();
  });

  test.describe('Component Interaction States', () => {
    test('should match debug panel button states', async ({ page }) => {
      await page.keyboard.press('Control+d');
      const panel = page.locator('text=Animation Debug').locator('..');
      await expect(panel).toBeVisible();
      await page.waitForTimeout(300);
      
      const toggleButton = page.locator('button:has-text("Enable Animations"), button:has-text("Disable Animations")').first();
      
      // Normal state
      await expect(toggleButton).toHaveScreenshot('button-state-normal.png', {
        animations: 'disabled',
        maxDiffPixels: 50,
      });
      
      // Hover state
      await toggleButton.hover();
      await page.waitForTimeout(200);
      await expect(toggleButton).toHaveScreenshot('button-state-hover.png', {
        animations: 'disabled',
        maxDiffPixels: 50,
      });
    });

    test('should match close button in different contexts', async ({ page }) => {
      // Debug panel close button
      await page.keyboard.press('Control+d');
      await page.waitForTimeout(300);
      const panelCloseButton = page.locator('text=Animation Debug').locator('..').locator('button').first();
      
      await expect(panelCloseButton).toHaveScreenshot('close-button-debug-panel.png', {
        animations: 'disabled',
        maxDiffPixels: 50,
      });
      
      // Modal close button
      await page.keyboard.press('?');
      await page.waitForTimeout(300);
      const modalCloseButton = page.locator('[aria-label="Close"]').first();
      
      await expect(modalCloseButton).toHaveScreenshot('close-button-modal.png', {
        animations: 'disabled',
        maxDiffPixels: 50,
      });
    });
  });

  test.describe('Layout Combinations', () => {
    test('should match debug panel and modal open simultaneously', async ({ page }) => {
      // Open debug panel
      await page.keyboard.press('Control+d');
      await page.waitForTimeout(300);
      
      // Open keyboard shortcuts modal
      await page.keyboard.press('?');
      await page.waitForTimeout(300);
      
      await expect(page).toHaveScreenshot('layout-panel-and-modal.png', {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixels: 200,
      });
    });

    test('should match all interactive elements visible', async ({ page }) => {
      // Open debug panel
      await page.keyboard.press('Control+d');
      
      // Toggle animation to show override warning
      await page.keyboard.press('Control+a');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('layout-all-elements-visible.png', {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixels: 200,
      });
    });
  });

  test.describe('Responsive Breakpoints', () => {
    const breakpoints = [
      { name: 'mobile-small', width: 320, height: 568 },
      { name: 'mobile-medium', width: 375, height: 667 },
      { name: 'mobile-large', width: 414, height: 896 },
      { name: 'tablet-portrait', width: 768, height: 1024 },
      { name: 'tablet-landscape', width: 1024, height: 768 },
      { name: 'desktop-small', width: 1280, height: 720 },
      { name: 'desktop-large', width: 1920, height: 1080 },
    ];

    for (const breakpoint of breakpoints) {
      test(`should match layout at ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`, async ({ page }) => {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
        await page.waitForTimeout(1000);
        
        await expect(page).toHaveScreenshot(`breakpoint-${breakpoint.name}.png`, {
          fullPage: true,
          animations: 'disabled',
          maxDiffPixels: 250,
        });
      });
    }
  });

  test.describe('Accessibility States', () => {
    test('should match focus visible states', async ({ page }) => {
      await page.keyboard.press('Control+d');
      await page.waitForTimeout(300);
      
      // Focus on toggle button using keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      
      const panel = page.locator('text=Animation Debug').locator('..');
      await expect(panel).toHaveScreenshot('focus-visible-toggle-button.png', {
        animations: 'disabled',
        maxDiffPixels: 100,
      });
    });

    test('should match high contrast mode', async ({ page }) => {
      // Simulate high contrast (note: actual high contrast requires OS-level settings)
      await page.emulateMedia({ forcedColors: 'active' });
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('high-contrast-mode.png', {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixels: 300,
      });
    });
  });

  test.describe('Badge and Indicator States', () => {
    test('should match AI badge appearance', async ({ page }) => {
      const badge = page.locator('[class*="bg-gradient-to-r"]:has-text("AI")').first();
      await expect(badge).toBeVisible();
      await page.waitForTimeout(500);
      
      await expect(badge).toHaveScreenshot('ai-badge.png', {
        animations: 'disabled',
        maxDiffPixels: 50,
      });
    });

    test('should match override warning indicator', async ({ page }) => {
      await page.keyboard.press('Control+d');
      await page.keyboard.press('Control+a');
      await page.waitForTimeout(500);
      
      const warningIndicator = page.locator('text=⚠️ Manual override active');
      await expect(warningIndicator).toBeVisible();
      
      await expect(warningIndicator).toHaveScreenshot('override-warning-indicator.png', {
        animations: 'disabled',
        maxDiffPixels: 50,
      });
    });

    test('should match status indicator (ON)', async ({ page }) => {
      await page.keyboard.press('Control+d');
      await page.keyboard.press('Control+a'); // Toggle to ensure ON state
      await page.waitForTimeout(500);
      
      const statusSection = page.locator('text=Reduced Motion:').locator('..');
      await expect(statusSection).toBeVisible();
      
      await expect(statusSection).toHaveScreenshot('status-indicator-on.png', {
        animations: 'disabled',
        maxDiffPixels: 50,
      });
    });
  });

  test.describe('Typography and Text Rendering', () => {
    test('should match keyboard shortcut formatting', async ({ page }) => {
      await page.keyboard.press('?');
      await page.waitForTimeout(300);
      
      const shortcutSection = page.locator('text=Developer Tools').locator('..');
      await expect(shortcutSection).toBeVisible();
      
      await expect(shortcutSection).toHaveScreenshot('keyboard-shortcut-formatting.png', {
        animations: 'disabled',
        maxDiffPixels: 100,
      });
    });

    test('should match onboarding text layout', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.removeItem('debug-panel-onboarding-seen');
      });
      await page.reload();
      await page.waitForTimeout(2000);
      
      const contentSection = page.locator('text=New debugging tools are available').locator('..');
      await expect(contentSection).toBeVisible();
      
      await expect(contentSection).toHaveScreenshot('onboarding-text-layout.png', {
        animations: 'disabled',
        maxDiffPixels: 100,
      });
    });
  });

  test.describe('Color Scheme Variations', () => {
    test('should match gradient effects', async ({ page }) => {
      const chatButton = page.locator('button:has(svg)').filter({ has: page.locator('text=AI') }).first();
      await expect(chatButton).toBeVisible();
      await page.waitForTimeout(1000);
      
      // Capture just the button with its gradient
      await expect(chatButton).toHaveScreenshot('gradient-chat-button.png', {
        animations: 'disabled',
        maxDiffPixels: 100,
      });
    });

    test('should match shadow effects', async ({ page }) => {
      await page.keyboard.press('Control+d');
      await page.waitForTimeout(300);
      
      const panel = page.locator('text=Animation Debug').locator('..');
      await expect(panel).toBeVisible();
      
      // Capture panel with shadow
      await expect(panel).toHaveScreenshot('shadow-debug-panel.png', {
        animations: 'disabled',
        maxDiffPixels: 150,
      });
    });
  });

  test.describe('Edge Cases', () => {
    test('should match very narrow viewport', async ({ page }) => {
      await page.setViewportSize({ width: 280, height: 568 });
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('edge-case-narrow-viewport.png', {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixels: 200,
      });
    });

    test('should match very wide viewport', async ({ page }) => {
      await page.setViewportSize({ width: 2560, height: 1440 });
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('edge-case-wide-viewport.png', {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixels: 300,
      });
    });

    test('should match text overflow handling', async ({ page }) => {
      await page.setViewportSize({ width: 280, height: 568 });
      await page.keyboard.press('Control+d');
      await page.waitForTimeout(300);
      
      const panel = page.locator('text=Animation Debug').locator('..');
      await expect(panel).toBeVisible();
      
      await expect(panel).toHaveScreenshot('edge-case-text-overflow.png', {
        animations: 'disabled',
        maxDiffPixels: 100,
      });
    });
  });
});
