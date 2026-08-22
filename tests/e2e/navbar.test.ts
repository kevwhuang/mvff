import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

const DESKTOP_VIEWPORT = { height: 800, width: 1_280 } as const;
const MOBILE_VIEWPORT = { height: 844, width: 390 } as const;
const STORE_HREF = 'https://shop.atxmusicvideofilmfestival.com';

function getRootOverflow(page: Page) {
    return page.evaluate(() => document.documentElement.style.overflow);
}

test.describe('navbar desktop', () => {
    test('shows every nav link and the countdown while hiding the mobile menu controls', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('.navbar__menu-link[href="/"]')).toBeVisible();
        await expect(page.locator('.navbar__menu-link[href="/info"]')).toBeVisible();
        await expect(page.locator('.navbar__menu-link[href="/team"]')).toBeVisible();
        await expect(page.locator('.navbar__menu-link[href="/gallery"]')).toBeVisible();
        await expect(page.locator(`.navbar__menu-link[href="${STORE_HREF}"]`)).toBeVisible();
        await expect(page.locator('.navbar__countdown')).toBeVisible();
        await expect(page.locator('.navbar__toggle')).toBeHidden();
        await expect(page.locator('.navbar__menu-close')).toBeHidden();
    });

    test('marks the active route with aria-current and moves it after client router navigation', async ({ page }) => {
        await page.goto('/');

        const home = page.locator('.navbar__menu-link[href="/"]');
        const info = page.locator('.navbar__menu-link[href="/info"]');

        await expect(home).toHaveAttribute('aria-current', 'page');
        await expect(info).not.toHaveAttribute('aria-current');

        await info.click();

        await expect(page).toHaveURL('/info');
        await expect(info).toHaveAttribute('aria-current', 'page');
        await expect(home).not.toHaveAttribute('aria-current');
    });

    test('renders the store link focusable and opening off-site in a new tab', async ({ page }) => {
        await page.goto('/info');

        const store = page.locator(`.navbar__menu-link[href="${STORE_HREF}"]`);

        await expect(store).toHaveAttribute('rel', 'noopener');
        await expect(store).toHaveAttribute('target', '_blank');
        await expect(store).not.toHaveAttribute('aria-disabled');
        await expect(store).not.toHaveAttribute('tabindex');
    });

    test('navigates home from the brand link', async ({ page }) => {
        await page.goto('/info');
        await page.locator('.navbar__brand').click();

        await expect(page).toHaveURL('/');
        await expect(page.locator('#hero-title')).toBeVisible();
    });
});

test.describe('navbar mobile menu', () => {
    test.use({ viewport: MOBILE_VIEWPORT });

    test.beforeEach(async ({ page }) => {
        await page.goto('/info');

        await expect(page.locator('.navbar__menu-link[href="/info"]')).toHaveAttribute('aria-current', 'page');
    });

    test('shows the menu toggle with the drawer closed and the countdown hidden', async ({ page }) => {
        const menu = page.locator('.navbar__menu');
        const toggle = page.locator('.navbar__toggle');

        await expect(toggle).toBeVisible();
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(menu).toBeHidden();
        await expect(menu).not.toHaveAttribute('data-open');
        await expect(page.locator('.navbar__countdown')).toBeHidden();
    });

    test('opens the drawer as a modal dialog, focuses the close button, and locks page scrolling', async ({ page }) => {
        const close = page.locator('.navbar__menu-close');
        const menu = page.locator('.navbar__menu');
        const toggle = page.locator('.navbar__toggle');

        await toggle.click();

        await expect(menu).toBeVisible();
        await expect(menu).toHaveAttribute('aria-modal', 'true');
        await expect(menu).toHaveAttribute('data-open', '');
        await expect(menu).toHaveAttribute('role', 'dialog');
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await expect(close).toBeFocused();

        expect(await getRootOverflow(page)).toBe('hidden');
    });

    test('cycles tab focus through the close button and every link without leaving the drawer', async ({ page }) => {
        const close = page.locator('.navbar__menu-close');
        const gallery = page.locator('.navbar__menu-link[href="/gallery"]');
        const home = page.locator('.navbar__menu-link[href="/"]');
        const info = page.locator('.navbar__menu-link[href="/info"]');
        const store = page.locator(`.navbar__menu-link[href="${STORE_HREF}"]`);
        const team = page.locator('.navbar__menu-link[href="/team"]');

        await page.locator('.navbar__toggle').click();

        await expect(close).toBeFocused();

        await page.keyboard.press('Tab');

        await expect(home).toBeFocused();

        await page.keyboard.press('Tab');

        await expect(info).toBeFocused();

        await page.keyboard.press('Tab');

        await expect(team).toBeFocused();

        await page.keyboard.press('Tab');

        await expect(gallery).toBeFocused();

        await page.keyboard.press('Tab');

        await expect(store).toBeFocused();

        await page.keyboard.press('Tab');

        await expect(close).toBeFocused();

        await page.keyboard.press('Shift+Tab');

        await expect(store).toBeFocused();
    });

    test('closes the drawer on escape and restores focus to the toggle', async ({ page }) => {
        const menu = page.locator('.navbar__menu');
        const toggle = page.locator('.navbar__toggle');

        await toggle.click();

        await expect(page.locator('.navbar__menu-close')).toBeFocused();

        await page.keyboard.press('Tab');

        await expect(page.locator('.navbar__menu-link[href="/"]')).toBeFocused();

        await page.keyboard.press('Escape');

        await expect(menu).toBeHidden();
        await expect(menu).not.toHaveAttribute('aria-modal');
        await expect(menu).not.toHaveAttribute('data-open');
        await expect(menu).not.toHaveAttribute('role');
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(toggle).toBeFocused();

        expect(await getRootOverflow(page)).toBe('');
    });

    test('closes the drawer from the close button and restores focus to the toggle', async ({ page }) => {
        const close = page.locator('.navbar__menu-close');
        const menu = page.locator('.navbar__menu');
        const toggle = page.locator('.navbar__toggle');

        await toggle.click();

        await expect(close).toBeFocused();

        await close.click();

        await expect(menu).toBeHidden();
        await expect(menu).not.toHaveAttribute('data-open');
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(toggle).toBeFocused();

        expect(await getRootOverflow(page)).toBe('');
    });

    test('closes the persisted drawer and restores page scrolling when a drawer link starts a client router navigation', async ({ page }) => {
        const menu = page.locator('.navbar__menu');
        const toggle = page.locator('.navbar__toggle');

        await toggle.click();

        await expect(page.locator('.navbar__menu-close')).toBeFocused();

        await page.locator('.navbar__menu-link[href="/team"]').click();

        await expect(page).toHaveURL('/team');
        await expect(menu).toBeHidden();
        await expect(menu).not.toHaveAttribute('data-open');
        await expect(menu).not.toHaveAttribute('role');
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');

        expect(await getRootOverflow(page)).toBe('');
    });

    test('closes the drawer and focuses the current route link when the viewport widens past the mobile breakpoint', async ({ page }) => {
        const menu = page.locator('.navbar__menu');
        const toggle = page.locator('.navbar__toggle');

        await toggle.click();

        await expect(menu).toHaveAttribute('data-open', '');

        await page.setViewportSize(DESKTOP_VIEWPORT);

        await expect(menu).not.toHaveAttribute('data-open');
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(page.locator('.navbar__menu-link[href="/info"]')).toBeFocused();

        expect(await getRootOverflow(page)).toBe('');
    });
});

test.describe('navbar mobile menu under reduced motion', () => {
    test.use({ viewport: MOBILE_VIEWPORT });

    test.beforeEach(async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/info');

        await expect(page.locator('.navbar__menu-link[href="/info"]')).toHaveAttribute('aria-current', 'page');
    });

    test('opens the drawer and focuses the close button', async ({ page }) => {
        const close = page.locator('.navbar__menu-close');
        const menu = page.locator('.navbar__menu');

        await page.locator('.navbar__toggle').click();

        await expect(menu).toHaveAttribute('data-open', '');
        await expect(close).toBeFocused();
    });
});
