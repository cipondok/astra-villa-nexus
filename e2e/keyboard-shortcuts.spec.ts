import { test, expect } from '@playwright/test';

test.describe('Keyboard Shortcuts Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('debug-panel-onboarding-seen', 'true');
    });
    await page.reload();
  });

  test('should open keyboard shortcuts modal with ? key', async ({ page }) => {
    await page.keyboard.press('?');
    
    // Modal should appear
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
    await expect(page.locator('text=Developer Tools')).toBeVisible();
  });

  test('should open keyboard shortcuts modal with Cmd/Ctrl + /', async ({ page }) => {
    await page.keyboard.press('Control+/');
    
    // Modal should appear
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
  });

  test('should display all shortcut categories', async ({ page }) => {
    await page.keyboard.press('?');
    
    // Check for categories
    await expect(page.locator('text=Developer Tools')).toBeVisible();
    await expect(page.locator('text=Animation Controls')).toBeVisible();
  });

  test('should show debug panel shortcuts', async ({ page }) => {
    await page.keyboard.press('?');
    
    // Check for debug panel specific shortcuts
    await expect(page.locator('text=Toggle Debug Panel')).toBeVisible();
    await expect(page.locator('text=Toggle Animations')).toBeVisible();
  });

  test('should close modal with Escape key', async ({ page }) => {
    await page.keyboard.press('?');
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
    
    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Keyboard Shortcuts')).not.toBeVisible();
  });

  test('should close modal with close button', async ({ page }) => {
    await page.keyboard.press('?');
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
    
    // Find and click close button (X)
    const closeButton = page.locator('[aria-label="Close"]').first();
    await closeButton.click();
    
    await expect(page.locator('text=Keyboard Shortcuts')).not.toBeVisible();
  });

  test('should show reset shortcut when override is active', async ({ page }) => {
    // Create an override by toggling animation
    await page.keyboard.press('Control+a');
    await page.waitForTimeout(500);
    
    // Open shortcuts modal
    await page.keyboard.press('?');
    
    // Reset shortcut should be visible
    await expect(page.locator('text=Reset to System')).toBeVisible();
  });

  test('should format keyboard shortcuts correctly', async ({ page }) => {
    await page.keyboard.press('?');
    
    // Check for proper kbd element formatting
    const kbdElements = page.locator('kbd');
    const count = await kbdElements.count();
    expect(count).toBeGreaterThan(0);
    
    // Verify common shortcuts are displayed
    await expect(page.locator('kbd:has-text("D")')).toBeVisible();
    await expect(page.locator('kbd:has-text("A")')).toBeVisible();
  });
});
