import { test, expect } from '@playwright/test';
import AxeBuilder from 'axe-playwright';

test.describe('Accessibility Audits', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('debug-panel-onboarding-seen', 'true');
    });
  });

  test('should not have any automatically detectable WCAG A or AA violations', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should meet color contrast requirements (4.5:1)', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('body')
      .analyze();

    const contrastViolations = results.violations.filter(
      v => v.id === 'color-contrast'
    );

    expect(contrastViolations).toHaveLength(0);
  });

  test('should have valid ARIA attributes', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const ariaViolations = results.violations.filter(v =>
      v.id.includes('aria')
    );

    expect(ariaViolations).toHaveLength(0);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze();

    expect(results.violations).toHaveLength(0);
  });

  test('should have alt text on images', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze();

    expect(results.violations).toHaveLength(0);
  });

  test('should have labels on form inputs', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['label'])
      .analyze();

    expect(results.violations).toHaveLength(0);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluateHandle(() => document.activeElement);
    const tagName = await focusedElement.evaluate(el => el?.tagName);
    
    expect(['BUTTON', 'A', 'INPUT']).toContain(tagName);
  });

  test('debug panel should be accessible', async ({ page }) => {
    await page.keyboard.press('Control+d');
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .include('[class*="debug"]')
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('chat widget should be accessible', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('button:has(svg)')
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('should generate detailed accessibility report', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    console.log('\n📊 Accessibility Report:');
    console.log(`  ✓ Passes: ${results.passes.length}`);
    console.log(`  ✗ Violations: ${results.violations.length}`);
    console.log(`  ⚠ Incomplete: ${results.incomplete.length}`);

    if (results.violations.length > 0) {
      console.log('\n🚨 Violations:');
      results.violations.forEach((violation, i) => {
        console.log(`\n  ${i + 1}. ${violation.id} (${violation.impact})`);
        console.log(`     ${violation.description}`);
        console.log(`     Help: ${violation.helpUrl}`);
        console.log(`     Affected nodes: ${violation.nodes.length}`);
      });
    }
  });
});
