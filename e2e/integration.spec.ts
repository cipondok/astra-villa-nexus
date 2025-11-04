import { test, expect } from '@playwright/test';

test.describe('Integration Tests - Complete User Flow', () => {
  test('complete first-time user journey', async ({ page }) => {
    // Clear storage for fresh start
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Step 1: See onboarding tooltip
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Developer Tools Available!')).toBeVisible();
    
    // Step 2: Click "Try It Now" to open debug panel
    await page.click('button:has-text("Try It Now")');
    await expect(page.locator('text=Animation Debug')).toBeVisible();
    
    // Step 3: Toggle animation
    await page.click('button:has-text("Enable Animations"), button:has-text("Disable Animations")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=⚠️ Manual override active')).toBeVisible();
    
    // Step 4: Open keyboard shortcuts
    await page.click('button:has-text("View all shortcuts")');
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
    
    // Step 5: Close modal
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Keyboard Shortcuts')).not.toBeVisible();
    
    // Step 6: Reset to system settings
    await page.click('button:has-text("Reset to System Setting")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=⚠️ Manual override active')).not.toBeVisible();
    
    // Step 7: Verify chat widget is still accessible
    const chatButton = page.locator('button:has(svg)').filter({ has: page.locator('text=AI') });
    await expect(chatButton).toBeVisible();
  });

  test('keyboard-only navigation flow', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('debug-panel-onboarding-seen', 'true');
    });
    await page.reload();
    
    // Open debug panel with keyboard
    await page.keyboard.press('Control+d');
    await expect(page.locator('text=Animation Debug')).toBeVisible();
    
    // Toggle animation with keyboard
    await page.keyboard.press('Control+a');
    await page.waitForTimeout(500);
    await expect(page.locator('text=⚠️ Manual override active')).toBeVisible();
    
    // Open shortcuts with keyboard
    await page.keyboard.press('?');
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
    
    // Close shortcuts with keyboard
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Keyboard Shortcuts')).not.toBeVisible();
    
    // Reset with keyboard (when override is active)
    await page.keyboard.press('Control+r');
    await page.waitForTimeout(500);
    await expect(page.locator('text=⚠️ Manual override active')).not.toBeVisible();
    
    // Close debug panel with keyboard
    await page.keyboard.press('Control+d');
    await expect(page.locator('text=Animation Debug')).not.toBeVisible();
  });

  test('mobile user flow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('debug-panel-onboarding-seen', 'true');
    });
    await page.reload();
    
    // Verify all components are accessible on mobile
    const settingsButton = page.locator('button[title="Animation Debug Panel"]');
    await expect(settingsButton).toBeVisible();
    
    const chatButton = page.locator('button:has(svg)').filter({ has: page.locator('text=AI') });
    await expect(chatButton).toBeVisible();
    
    // Open debug panel
    await settingsButton.click();
    await expect(page.locator('text=Animation Debug')).toBeVisible();
    
    // Verify panel is properly sized for mobile
    const panel = page.locator('text=Animation Debug').locator('..');
    const boundingBox = await panel.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(375);
  });

  test('persistent state across page reloads', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Dismiss onboarding
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Got It")');
    
    // Create animation override
    await page.keyboard.press('Control+d');
    await page.keyboard.press('Control+a');
    await page.waitForTimeout(500);
    
    // Reload page
    await page.reload();
    
    // Verify onboarding doesn't show again
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Developer Tools Available!')).not.toBeVisible();
    
    // Verify animation override persisted
    await page.keyboard.press('Control+d');
    await expect(page.locator('text=⚠️ Manual override active')).toBeVisible();
  });

  test('multiple panels coexistence', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('debug-panel-onboarding-seen', 'true');
    });
    await page.reload();
    
    // Open debug panel
    await page.keyboard.press('Control+d');
    await expect(page.locator('text=Animation Debug')).toBeVisible();
    
    // Open keyboard shortcuts modal
    await page.keyboard.press('?');
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
    
    // Both should be visible simultaneously
    await expect(page.locator('text=Animation Debug')).toBeVisible();
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
    
    // Chat widget should still be visible
    const chatButton = page.locator('button:has(svg)').filter({ has: page.locator('text=AI') });
    await expect(chatButton).toBeVisible();
  });
});
