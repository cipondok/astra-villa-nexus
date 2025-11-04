import { test, expect } from '@playwright/test';

test.describe('Onboarding Tooltip', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to simulate first visit
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should display onboarding tooltip on first visit in development', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the onboarding tooltip to appear (with 1.5s delay)
    await page.waitForTimeout(2000);
    
    // Check if onboarding tooltip is visible
    const tooltip = page.locator('text=Developer Tools Available!');
    await expect(tooltip).toBeVisible();
    
    // Verify content
    await expect(page.locator('text=New debugging tools are available')).toBeVisible();
    await expect(page.locator('text=Debug Panel:')).toBeVisible();
    await expect(page.locator('text=Keyboard Shortcuts:')).toBeVisible();
  });

  test('should show keyboard shortcuts in onboarding', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check for keyboard shortcuts
    await expect(page.locator('text=⌘/Ctrl + D')).toBeVisible();
    await expect(page.locator('text=⌘/Ctrl + A')).toBeVisible();
    await expect(page.locator('kbd:has-text("?")')).toBeVisible();
  });

  test('should dismiss onboarding with "Got It" button', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    const tooltip = page.locator('text=Developer Tools Available!');
    await expect(tooltip).toBeVisible();
    
    // Click "Got It" button
    await page.click('button:has-text("Got It")');
    
    // Tooltip should disappear
    await expect(tooltip).not.toBeVisible();
    
    // Verify localStorage is set
    const hasSeenOnboarding = await page.evaluate(() => 
      localStorage.getItem('debug-panel-onboarding-seen')
    );
    expect(hasSeenOnboarding).toBe('true');
  });

  test('should open debug panel with "Try It Now" button', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Click "Try It Now" button
    await page.click('button:has-text("Try It Now")');
    
    // Debug panel should open
    await expect(page.locator('text=Animation Debug')).toBeVisible();
    
    // Onboarding should be dismissed
    await expect(page.locator('text=Developer Tools Available!')).not.toBeVisible();
  });

  test('should not show onboarding on subsequent visits', async ({ page }) => {
    // First visit
    await page.goto('/');
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Got It")');
    
    // Reload page
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Onboarding should not appear
    await expect(page.locator('text=Developer Tools Available!')).not.toBeVisible();
  });

  test('should close onboarding with X button', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    const tooltip = page.locator('text=Developer Tools Available!');
    await expect(tooltip).toBeVisible();
    
    // Find and click the X button within the onboarding tooltip
    await page.locator('[data-testid="onboarding-close"], button[aria-label="Close"]').first().click();
    
    // Tooltip should disappear
    await expect(tooltip).not.toBeVisible();
  });
});
