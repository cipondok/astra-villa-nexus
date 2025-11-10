import { Page, expect } from '@playwright/test';

/**
 * Test utility functions for E2E tests
 */

export class SearchPageHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to homepage and wait for load
   */
  async navigateToHome() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the main search input
   */
  getSearchInput() {
    return this.page.locator('input[placeholder*="Search" i], input[placeholder*="Cari" i]').first();
  }

  /**
   * Get the search button
   */
  getSearchButton() {
    return this.page.locator('button:has-text("Search"), button:has-text("Cari"), button:has([class*="lucide-search"])').first();
  }

  /**
   * Perform a search
   */
  async performSearch(query: string) {
    const input = this.getSearchInput();
    await input.fill(query);
    await input.press('Enter');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Open advanced filters
   */
  async openFilters() {
    const filterButton = this.page.locator('button:has-text("Filter"), button:has([class*="lucide-filter"])').first();
    
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await this.page.waitForTimeout(500);
      return true;
    }
    return false;
  }

  /**
   * Switch listing type tab
   */
  async switchToTab(tabName: 'All' | 'Sale' | 'Rent') {
    const tab = this.page.locator(`[role="tab"]:has-text("${tabName}"), button:has-text("${tabName}")`).first();
    
    if (await tab.isVisible()) {
      await tab.click();
      await this.page.waitForTimeout(500);
      return true;
    }
    return false;
  }

  /**
   * Get property cards
   */
  getPropertyCards() {
    return this.page.locator('[class*="property-card"], [class*="PropertyCard"], article, [data-testid*="property"]');
  }

  /**
   * Click on first property card
   */
  async clickFirstProperty() {
    const propertyLink = this.page.locator('a[href*="/properties/"], [class*="property-card"] a, article a').first();
    
    if (await propertyLink.isVisible()) {
      await propertyLink.click();
      await this.page.waitForLoadState('networkidle');
      return true;
    }
    return false;
  }

  /**
   * Check if suggestions are visible
   */
  async areSuggestionsVisible() {
    const suggestions = this.page.locator('[role="listbox"], .suggestions, [class*="suggestion"]');
    return (await suggestions.count()) > 0;
  }

  /**
   * Get results count text
   */
  async getResultsCount() {
    const resultsText = this.page.locator('text=/\\d+.*properties/i, text=/\\d+.*results/i');
    if (await resultsText.isVisible()) {
      const text = await resultsText.textContent();
      const match = text?.match(/(\d+)/);
      return match ? parseInt(match[1]) : null;
    }
    return null;
  }

  /**
   * Check if page is in mobile viewport
   */
  isMobileViewport() {
    const viewport = this.page.viewportSize();
    return (viewport?.width || 0) < 768;
  }

  /**
   * Scroll to bottom of page
   */
  async scrollToBottom() {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await this.page.waitForTimeout(500);
  }

  /**
   * Scroll to top of page
   */
  async scrollToTop() {
    await this.page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await this.page.waitForTimeout(300);
  }

  /**
   * Wait for network idle
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take screenshot with name
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Check accessibility of element
   */
  async checkAccessibility(selector: string) {
    const element = this.page.locator(selector).first();
    
    if (await element.isVisible()) {
      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledBy = await element.getAttribute('aria-labelledby');
      const text = await element.textContent();
      
      return !!(ariaLabel || ariaLabelledBy || text);
    }
    return false;
  }

  /**
   * Get current URL
   */
  getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Check if element has focus
   */
  async hasFocus(selector: string) {
    const element = this.page.locator(selector).first();
    return await element.evaluate((el) => el === document.activeElement);
  }

  /**
   * Simulate slow network (for testing loading states)
   */
  async simulateSlowNetwork() {
    await this.page.route('**/*', (route) => {
      setTimeout(() => route.continue(), 2000);
    });
  }

  /**
   * Simulate offline (for testing offline mode)
   */
  async simulateOffline() {
    await this.page.context().setOffline(true);
  }

  /**
   * Restore online
   */
  async restoreOnline() {
    await this.page.context().setOffline(false);
  }
}

/**
 * Mobile-specific test helpers
 */
export class MobileHelpers {
  constructor(private page: Page) {}

  /**
   * Tap on element (mobile touch)
   */
  async tapElement(selector: string) {
    const element = this.page.locator(selector).first();
    await element.tap();
  }

  /**
   * Swipe horizontally
   */
  async swipeHorizontal(startX: number, startY: number, endX: number, endY: number) {
    await this.page.touchscreen.tap(startX, startY);
    await this.page.mouse.move(endX, endY);
  }

  /**
   * Swipe vertically
   */
  async swipeVertical(distance: number) {
    await this.page.evaluate((dist) => window.scrollBy(0, dist), distance);
    await this.page.waitForTimeout(300);
  }

  /**
   * Change orientation
   */
  async changeOrientation(orientation: 'portrait' | 'landscape') {
    const viewport = this.page.viewportSize();
    if (!viewport) return;

    if (orientation === 'landscape') {
      await this.page.setViewportSize({
        width: Math.max(viewport.width, viewport.height),
        height: Math.min(viewport.width, viewport.height),
      });
    } else {
      await this.page.setViewportSize({
        width: Math.min(viewport.width, viewport.height),
        height: Math.max(viewport.width, viewport.height),
      });
    }
    await this.page.waitForTimeout(300);
  }

  /**
   * Check touch target size
   */
  async checkTouchTargetSize(selector: string, minSize: number = 44) {
    const element = this.page.locator(selector).first();
    const box = await element.boundingBox();
    
    if (box) {
      return box.width >= minSize && box.height >= minSize;
    }
    return false;
  }

  /**
   * Simulate pull-to-refresh
   */
  async pullToRefresh() {
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.page.waitForTimeout(200);
    await this.page.touchscreen.tap(200, 100);
    await this.page.evaluate(() => window.scrollBy(0, -150));
    await this.page.waitForTimeout(500);
  }
}

/**
 * Assertion helpers
 */
export class AssertionHelpers {
  constructor(private page: Page) {}

  /**
   * Assert element is visible within timeout
   */
  async assertVisible(selector: string, timeout: number = 5000) {
    const element = this.page.locator(selector).first();
    await expect(element).toBeVisible({ timeout });
  }

  /**
   * Assert URL contains string
   */
  async assertUrlContains(substring: string) {
    const url = this.page.url();
    expect(url).toContain(substring);
  }

  /**
   * Assert element has text
   */
  async assertHasText(selector: string, text: string | RegExp) {
    const element = this.page.locator(selector).first();
    await expect(element).toContainText(text);
  }

  /**
   * Assert element count
   */
  async assertCount(selector: string, count: number) {
    const elements = this.page.locator(selector);
    await expect(elements).toHaveCount(count);
  }

  /**
   * Assert input has value
   */
  async assertInputValue(selector: string, value: string) {
    const input = this.page.locator(selector).first();
    await expect(input).toHaveValue(value);
  }
}
