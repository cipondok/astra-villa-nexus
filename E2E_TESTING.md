# E2E Testing Guide

Comprehensive end-to-end testing documentation for the Astra Villa property platform using Playwright.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Writing Tests](#writing-tests)
- [Mobile Testing](#mobile-testing)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Installation

Playwright is already installed in the project. To set it up:

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Install system dependencies (Linux only)
npx playwright install-deps
```

### Running Tests

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test e2e/property-search.spec.ts

# Run mobile-specific tests
npx playwright test e2e/mobile-search.spec.ts

# Run with UI mode (interactive)
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Debug mode
npx playwright test --debug

# Generate HTML report
npx playwright show-report
```

## 📁 Test Structure

```
e2e/
├── property-search.spec.ts      # Desktop property search flows
├── mobile-search.spec.ts         # Mobile-specific touch interactions
├── helpers/
│   └── test-utils.ts             # Reusable test utilities
└── screenshots/                  # Test screenshots (generated)

playwright.config.ts              # Playwright configuration
E2E_TESTING.md                    # This documentation
```

## 🧪 Test Coverage

### Property Search Flow (e2e/property-search.spec.ts)

**Basic Functionality:**
- ✅ Display search panel on homepage
- ✅ Enter search query
- ✅ Show suggestions when typing
- ✅ Execute search on button click
- ✅ Execute search on Enter key
- ✅ Display and switch listing type tabs
- ✅ Open advanced filters
- ✅ Display property results
- ✅ Navigate to property details
- ✅ Show results count
- ✅ Persist search query
- ✅ Clear search input
- ✅ Apply price filters
- ✅ Handle empty results gracefully
- ✅ Maintain state on page refresh

**Keyboard Navigation:**
- ✅ Navigate with Tab key
- ✅ Close filters with Escape
- ✅ Navigate suggestions with arrow keys

**Accessibility:**
- ✅ Accessible search input (ARIA labels)
- ✅ Accessible buttons
- ✅ Keyboard-only navigation

### Mobile Search (e2e/mobile-search.spec.ts)

**Touch Interactions:**
- ✅ Render on mobile viewport
- ✅ Mobile-optimized layout
- ✅ Touch tap on search input
- ✅ Show mobile keyboard
- ✅ Handle vertical scroll
- ✅ Show/hide panel on scroll
- ✅ Tap filter button
- ✅ Tap tabs to switch
- ✅ Swipe gestures on tabs
- ✅ Tap on suggestions
- ✅ Close keyboard on submit

**Mobile-Specific:**
- ✅ Handle orientation changes
- ✅ Pull-to-refresh gesture
- ✅ Prevent zoom on input focus
- ✅ Touch-friendly button sizes (44px minimum)
- ✅ Quick preset filters for mobile
- ✅ Tap preset filters
- ✅ Horizontal scroll filters
- ✅ Maintain scroll position
- ✅ Handle rapid taps
- ✅ Display loading states
- ✅ Handle safe area insets (iOS notch)

**Device Testing:**
- ✅ iPhone 13 Pro
- ✅ Android (Pixel 5)
- ✅ iPad Pro (tablet)

## ✍️ Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const element = page.locator('selector');
    
    // Act
    await element.click();
    
    // Assert
    await expect(element).toBeVisible();
  });
});
```

### Using Test Helpers

```typescript
import { SearchPageHelpers } from './helpers/test-utils';

test('search with helpers', async ({ page }) => {
  const helpers = new SearchPageHelpers(page);
  
  await helpers.navigateToHome();
  await helpers.performSearch('Villa Bali');
  
  const count = await helpers.getResultsCount();
  expect(count).toBeGreaterThan(0);
});
```

### Mobile Testing

```typescript
import { devices } from '@playwright/test';

test.use({ ...devices['iPhone 13 Pro'] });

test('mobile test', async ({ page }) => {
  const searchInput = page.locator('input[placeholder*="Search"]').first();
  await searchInput.tap(); // Use tap() for touch
  await searchInput.fill('Jakarta');
});
```

### Best Practices

✅ **DO:**
- Use `page.locator()` instead of `page.$`
- Wait for `networkidle` after navigation
- Use semantic selectors (role, text, placeholder)
- Test user workflows, not implementation
- Use helper functions for common actions
- Test on multiple devices/browsers
- Include accessibility checks

❌ **DON'T:**
- Use brittle selectors (CSS classes)
- Hard-code wait times (use `waitFor` instead)
- Test internal state
- Make tests dependent on each other
- Skip mobile testing
- Ignore accessibility

## 📱 Mobile Testing

### Supported Devices

Configured in `playwright.config.ts`:

- **iPhone 13 Pro** (iOS Safari)
- **Pixel 5** (Android Chrome)
- **iPad Pro** (Tablet)

### Touch Interactions

```typescript
// Tap element
await element.tap();

// Swipe
await page.touchscreen.tap(startX, startY);
await page.mouse.move(endX, endY);

// Scroll
await page.evaluate(() => window.scrollBy(0, 300));

// Change orientation
await page.setViewportSize({ width: 844, height: 390 });
```

### Mobile-Specific Assertions

```typescript
// Check viewport size
const viewport = page.viewportSize();
expect(viewport?.width).toBeLessThan(768);

// Check touch target size
const box = await element.boundingBox();
expect(box?.height).toBeGreaterThanOrEqual(44);

// Check for mobile keyboard
const inputType = await element.getAttribute('type');
expect(['text', 'search']).toContain(inputType);
```

## 🔄 CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
npx playwright test --reporter=list
```

## 🐛 Troubleshooting

### Tests Failing Locally

```bash
# Update browsers
npx playwright install

# Clear cache
rm -rf node_modules
npm ci
npx playwright install

# Run with trace
npx playwright test --trace on
```

### Flaky Tests

**Causes:**
- Network timing issues
- Animation timing
- Race conditions

**Solutions:**
```typescript
// Use auto-waiting
await expect(element).toBeVisible();

// Explicit waits
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500); // Last resort

// Retry failed tests
test.describe.configure({ retries: 2 });
```

### Debugging

```bash
# Debug mode (step through)
npx playwright test --debug

# Generate trace viewer
npx playwright test --trace on
npx playwright show-trace trace.zip

# Headed mode (see browser)
npx playwright test --headed

# Specific test only
npx playwright test --grep "search query"
```

### Element Not Found

```typescript
// Wait for element
await page.waitForSelector('selector');

// Use more flexible selectors
const element = page.locator('button:has-text("Search"), button:has-text("Cari")');

// Check if visible first
if (await element.isVisible()) {
  await element.click();
}
```

### Mobile Tests Failing

```bash
# Verify device emulation
npx playwright test --project="Mobile Safari"

# Check viewport
const viewport = page.viewportSize();
console.log(viewport);

# Test on actual device (using remote debugging)
npx playwright test --device="iPhone 13 Pro"
```

## 📊 Test Reports

### HTML Report

```bash
# Generate and open report
npx playwright show-report

# Report is saved to: playwright-report/index.html
```

### Trace Viewer

```bash
# View traces for failed tests
npx playwright show-trace trace.zip
```

### Screenshots

```bash
# Screenshots saved to: e2e/screenshots/
await page.screenshot({ path: 'e2e/screenshots/test.png' });
```

## 🎯 Test Metrics

Track these metrics in CI:

- **Pass Rate**: > 95%
- **Execution Time**: < 5 minutes total
- **Flake Rate**: < 2%
- **Coverage**: All critical user paths

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Mobile Testing](https://playwright.dev/docs/emulation)

## 🏆 E2E Testing Goals

**Current Status:**
- ✅ Desktop property search flows
- ✅ Mobile touch interactions
- ✅ Multi-device testing
- ✅ Accessibility checks

**Future Goals:**
- [ ] Visual regression testing
- [ ] Performance testing
- [ ] Cross-browser testing (Safari, Edge)
- [ ] API mocking for faster tests
- [ ] Parallel execution
- [ ] Test data management

---

**Questions?** Check [TESTING.md](TESTING.md) for unit testing or open an issue.

**Last Updated**: 2025-11-10
