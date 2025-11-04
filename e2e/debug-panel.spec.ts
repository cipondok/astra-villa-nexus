import { test, expect } from '@playwright/test';

test.describe('Debug Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage and dismiss onboarding
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('debug-panel-onboarding-seen', 'true');
    });
    await page.reload();
  });

  test('should open debug panel by clicking settings button', async ({ page }) => {
    // Find and click the settings button
    const settingsButton = page.locator('button[title="Animation Debug Panel"]');
    await expect(settingsButton).toBeVisible();
    await settingsButton.click();
    
    // Debug panel should be visible
    await expect(page.locator('text=Animation Debug')).toBeVisible();
  });

  test('should toggle debug panel with Cmd/Ctrl + D', async ({ page }) => {
    // Open panel with keyboard shortcut
    await page.keyboard.press('Control+d');
    await expect(page.locator('text=Animation Debug')).toBeVisible();
    
    // Close panel with keyboard shortcut
    await page.keyboard.press('Control+d');
    await expect(page.locator('text=Animation Debug')).not.toBeVisible();
  });

  test('should display current animation status', async ({ page }) => {
    await page.keyboard.press('Control+d');
    
    // Check for status display
    await expect(page.locator('text=Reduced Motion:')).toBeVisible();
    const status = page.locator('text=ON, text=OFF').first();
    await expect(status).toBeVisible();
  });

  test('should toggle animations with button click', async ({ page }) => {
    await page.keyboard.press('Control+d');
    
    // Get initial state
    const toggleButton = page.locator('button:has-text("Enable Animations"), button:has-text("Disable Animations")').first();
    const initialText = await toggleButton.textContent();
    
    // Click toggle button
    await toggleButton.click();
    
    // Wait for state change
    await page.waitForTimeout(500);
    
    // Verify button text changed
    const newText = await toggleButton.textContent();
    expect(newText).not.toBe(initialText);
  });

  test('should toggle animations with Cmd/Ctrl + A', async ({ page }) => {
    await page.keyboard.press('Control+d');
    
    // Get initial status
    const getStatus = async () => {
      const statusElement = page.locator('text=Reduced Motion:').locator('..').locator('span').last();
      return await statusElement.textContent();
    };
    
    const initialStatus = await getStatus();
    
    // Toggle with keyboard
    await page.keyboard.press('Control+a');
    await page.waitForTimeout(500);
    
    // Verify status changed
    const newStatus = await getStatus();
    expect(newStatus).not.toBe(initialStatus);
  });

  test('should show manual override warning when toggled', async ({ page }) => {
    await page.keyboard.press('Control+d');
    
    // Toggle animation
    await page.keyboard.press('Control+a');
    await page.waitForTimeout(500);
    
    // Check for override warning
    await expect(page.locator('text=⚠️ Manual override active')).toBeVisible();
    
    // Check for reset button
    await expect(page.locator('button:has-text("Reset to System Setting")')).toBeVisible();
  });

  test('should reset to system settings', async ({ page }) => {
    await page.keyboard.press('Control+d');
    
    // Toggle animation to create override
    await page.keyboard.press('Control+a');
    await page.waitForTimeout(500);
    
    // Click reset button
    await page.click('button:has-text("Reset to System Setting")');
    await page.waitForTimeout(500);
    
    // Override warning should disappear
    await expect(page.locator('text=⚠️ Manual override active')).not.toBeVisible();
    await expect(page.locator('button:has-text("Reset to System Setting")')).not.toBeVisible();
  });

  test('should close debug panel with X button', async ({ page }) => {
    await page.keyboard.press('Control+d');
    await expect(page.locator('text=Animation Debug')).toBeVisible();
    
    // Click X button
    const closeButton = page.locator('text=Animation Debug').locator('..').locator('button').first();
    await closeButton.click();
    
    // Panel should close
    await expect(page.locator('text=Animation Debug')).not.toBeVisible();
  });

  test('should open keyboard shortcuts modal from debug panel', async ({ page }) => {
    await page.keyboard.press('Control+d');
    
    // Click "View all shortcuts" button
    await page.click('button:has-text("View all shortcuts")');
    
    // Keyboard shortcuts modal should appear
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
    await expect(page.locator('text=Developer Tools')).toBeVisible();
  });

  test('should persist animation preference in localStorage', async ({ page }) => {
    await page.keyboard.press('Control+d');
    
    // Toggle animation
    await page.keyboard.press('Control+a');
    await page.waitForTimeout(500);
    
    // Check localStorage
    const override = await page.evaluate(() => 
      localStorage.getItem('prefers-reduced-motion-override')
    );
    expect(override).toBeTruthy();
    
    // Reload page and verify persistence
    await page.reload();
    await page.keyboard.press('Control+d');
    await expect(page.locator('text=⚠️ Manual override active')).toBeVisible();
  });
});
