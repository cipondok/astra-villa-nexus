import { test, expect } from '@playwright/test';

/**
 * Keyboard accessibility for the header user dropdown.
 * These run against the public shell; when no session is present the dropdown
 * trigger is absent and the assertions are skipped rather than failing CI.
 */
test.describe('User dropdown keyboard navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('opens with Enter, cycles with arrows, closes with Escape', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /user menu|menu pengguna/i });
    if ((await trigger.count()) === 0) test.skip(true, 'No authenticated session in this run.');

    await trigger.first().focus();
    await expect(trigger.first()).toHaveAttribute('aria-haspopup', 'menu');
    await page.keyboard.press('Enter');

    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();

    const items = menu.getByRole('menuitem');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);

    await page.keyboard.press('ArrowDown');
    await expect(items.first()).toBeFocused();

    await page.keyboard.press('ArrowUp');
    await expect(items.nth(count - 1)).toBeFocused();

    await page.keyboard.press('Home');
    await expect(items.first()).toBeFocused();
    await page.keyboard.press('End');
    await expect(items.nth(count - 1)).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(trigger.first()).toBeFocused();
  });

  test('active Management item is announced with aria-current and reachable by keyboard', async ({
    page,
  }) => {
    await page.goto('/my-properties');
    const trigger = page.getByRole('button', { name: /user menu|menu pengguna/i });
    if ((await trigger.count()) === 0) test.skip(true, 'No authenticated session in this run.');

    await trigger.first().focus();
    await page.keyboard.press('ArrowDown');

    const management = page.getByRole('menuitem', { name: /management|manajemen/i });
    if ((await management.count()) === 0) test.skip(true, 'Account has no listing role.');

    await expect(management.first()).toHaveAttribute('aria-current', 'page');

    // Reachable purely with ArrowDown.
    for (let i = 0; i < 8; i += 1) {
      if (await management.first().evaluate((el) => el === document.activeElement)) break;
      await page.keyboard.press('ArrowDown');
    }
    await expect(management.first()).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/my-properties/);
  });
});
