import { expect, test } from '@playwright/test';

const FOCUS_SETTLE = 300;
const FROZEN_COUNTDOWN = '00:00:00:00';
const ROUTE_HREFS = ['/', '/info', '/team', 'https://shop.atxmusicvideofilmfestival.com'] as const;
const STORE_URL = 'https://shop.atxmusicvideofilmfestival.com';

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.describe('navbar desktop', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('shows every primary route link', async ({ page }) => {
        for (const href of ROUTE_HREFS) {
            await expect(page.locator(`.navbar__menu-link[href="${href}"]`)).toBeVisible();
        }
    });

    test('disables the store route pending launch', async ({ page }) => {
        const store = page.locator(`.navbar__menu-link[href="${STORE_URL}"]`);

        await expect(store).toHaveAttribute('aria-disabled', 'true');
        await expect(store).toHaveAttribute('tabindex', '-1');
    });

    test('marks the active page after navigation', async ({ page }) => {
        await page.locator('.navbar__menu-link[href="/info"]').click();

        await expect(page).toHaveURL('/info');
        await expect(page.locator('#info-title')).toHaveText('Guest Info');
        await expect(page.locator('.navbar__menu-link[href="/info"]')).toHaveAttribute('aria-current', 'page');

        await page.locator('.navbar__menu-link[href="/"]').click();

        await expect(page).toHaveURL('/');
        await expect(page.locator('.navbar__menu-link[href="/"]')).toHaveAttribute('aria-current', 'page');
    });

    test('freezes the header countdown chip at zero for assistive tech', async ({ page }) => {
        const countdown = page.locator('.navbar__countdown');

        await expect(countdown).toHaveAttribute('aria-hidden', 'true');
        await expect(countdown).toHaveText(FROZEN_COUNTDOWN);

        await page.waitForTimeout(1_500);

        await expect(countdown).toHaveText(FROZEN_COUNTDOWN);
    });
});

test.describe('navbar mobile menu', () => {
    test.use({ viewport: { height: 667, width: 375 } });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('toggles the drawer and aria-expanded via the menu and close buttons', async ({ page }) => {
        const close = page.locator('.navbar__menu-close');
        const menu = page.locator('.navbar__menu');
        const toggle = page.locator('.navbar__toggle');

        await expect(toggle).toBeVisible();
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(menu).toBeHidden();

        await toggle.click();

        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await expect(menu).toBeVisible();

        await close.click();

        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(menu).toBeHidden();
    });

    test('moves focus into the drawer and exposes the nav links', async ({ page }) => {
        const menu = page.locator('.navbar__menu');

        await page.locator('.navbar__toggle').click();

        await expect(menu).toBeVisible();
        await expect(page.locator('.navbar__menu-close')).toBeFocused();
        await expect(menu.locator('.navbar__menu-link[href="/info"]')).toBeVisible();
        await expect(menu.locator('.navbar__menu-link[href="/team"]')).toBeVisible();
    });

    test('traps tab focus across the open drawer', async ({ page }) => {
        const close = page.locator('.navbar__menu-close');
        const links = page.locator('.navbar__menu a:not([tabindex="-1"])');

        await page.locator('.navbar__toggle').click();

        await expect(close).toBeFocused();
        await page.waitForTimeout(FOCUS_SETTLE);

        await page.keyboard.press('Shift+Tab');

        await expect(links.last()).toBeFocused();

        await page.keyboard.press('Tab');

        await expect(close).toBeFocused();
    });

    test('closes on escape and restores focus to the toggle', async ({ page }) => {
        const menu = page.locator('.navbar__menu');
        const toggle = page.locator('.navbar__toggle');

        await toggle.click();

        await expect(page.locator('.navbar__menu-close')).toBeFocused();

        await page.keyboard.press('Escape');

        await expect(menu).toBeHidden();
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(toggle).toBeFocused();
    });
});
