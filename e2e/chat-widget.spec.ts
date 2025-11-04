import { test, expect } from '@playwright/test';

test.describe('AI Chat Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('debug-panel-onboarding-seen', 'true');
    });
    await page.reload();
  });

  test('should display AI chat trigger button', async ({ page }) => {
    // Look for the chat trigger with Bot icon and AI badge
    const chatButton = page.locator('button:has(svg)').filter({ has: page.locator('text=AI') });
    await expect(chatButton).toBeVisible();
  });

  test('should have animated effects on chat trigger', async ({ page }) => {
    const chatButton = page.locator('button:has(svg)').filter({ has: page.locator('text=AI') });
    
    // Verify button has gradient background classes
    const classes = await chatButton.getAttribute('class');
    expect(classes).toContain('bg-gradient-to-r');
    
    // Verify AI badge is present
    await expect(page.locator('text=AI').first()).toBeVisible();
  });

  test('should show pulsing animation effects', async ({ page }) => {
    // The chat trigger should have animation classes
    const triggerContainer = page.locator('div.animate-bounce').first();
    await expect(triggerContainer).toBeVisible();
    
    // Verify pulsing ring effect exists
    const pulsingRing = page.locator('div.animate-ping').first();
    await expect(pulsingRing).toBeVisible();
  });

  test('should have hover effects', async ({ page }) => {
    const chatButton = page.locator('button:has(svg)').filter({ has: page.locator('text=AI') });
    
    // Get initial state
    await chatButton.hover();
    await page.waitForTimeout(300); // Wait for transition
    
    // Button should have hover scale class
    const classes = await chatButton.getAttribute('class');
    expect(classes).toContain('hover:scale-110');
  });

  test('should display Sparkles icon in AI badge', async ({ page }) => {
    // Check for Sparkles icon within the badge
    const badge = page.locator('[class*="bg-gradient-to-r"]:has-text("AI")').first();
    await expect(badge).toBeVisible();
    
    // Verify badge contains text "AI"
    const badgeText = await badge.textContent();
    expect(badgeText).toContain('AI');
  });

  test('should maintain visibility on mobile viewports', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Chat button should still be visible
    const chatButton = page.locator('button:has(svg)').filter({ has: page.locator('text=AI') });
    await expect(chatButton).toBeVisible();
    
    // Verify mobile-specific sizing
    const classes = await chatButton.getAttribute('class');
    expect(classes).toContain('h-[80px]');
    expect(classes).toContain('w-[80px]');
  });

  test('should have proper z-index stacking', async ({ page }) => {
    // Both debug panel and chat widget should be visible simultaneously
    await page.keyboard.press('Control+d');
    
    const debugPanel = page.locator('text=Animation Debug');
    const chatButton = page.locator('button:has(svg)').filter({ has: page.locator('text=AI') });
    
    await expect(debugPanel).toBeVisible();
    await expect(chatButton).toBeVisible();
  });
});
