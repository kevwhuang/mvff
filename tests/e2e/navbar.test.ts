import { expect, test } from '@playwright/test';

const CALENDLY_URL = 'https://calendly.com/madewellanna99/30min';
const COUNTDOWN_PATTERN = /^\d{2}:\d{2}:\d{2}:\d{2}$/;
const FOCUS_SETTLE = 300;
const PITCH_DECK_URL = '/austin_music_video_film_festival_pitch_deck.pdf';
const ROUTE_HREFS = ['/', '/info', 'https://shop.atxmusicvideofilmfestival.com', '/team', '/gallery', '/contact'] as const;
const STORE_URL = 'https://shop.atxmusicvideofilmfestival.com';

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.describe('navbar desktop', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('shows every primary route link and Buy Tickets', async ({ page }) => {
        for (const href of ROUTE_HREFS) {
            await expect(page.locator(`.site-nav__link[href="${href}"]`)).toBeVisible();
        }

        await expect(page.locator('.site-header__tickets')).toBeVisible();
    });

    test('opens the external store link in a new tab', async ({ page }) => {
        await expect(page.locator(`.site-nav__link[href="${STORE_URL}"]`)).toHaveAttribute('target', '_blank');
    });

    test('marks the active page after navigation', async ({ page }) => {
        await page.locator('.site-nav__link[href="/info"]').click();

        await expect(page).toHaveURL('/info');
        await expect(page.locator('#info-title')).toHaveText('Info');
        await expect(page.locator('.site-nav__link[href="/info"]')).toHaveAttribute('aria-current', 'page');

        await page.locator('.site-nav__link[href="/"]').click();

        await expect(page).toHaveURL('/');
        await expect(page.locator('.site-nav__link[href="/"]')).toHaveAttribute('aria-current', 'page');
    });

    test('ticks the header countdown in DD:HH:MM:SS format', async ({ page }) => {
        const countdown = page.locator('.site-header__countdown-text');

        await expect(countdown).toHaveText(COUNTDOWN_PATTERN);

        const first = (await countdown.textContent())?.trim();

        await expect.poll(async () => (await countdown.textContent())?.trim(), { timeout: 3_000 }).not.toBe(first);
    });
});

test.describe('navbar mobile menu', () => {
    test.use({ viewport: { height: 667, width: 375 } });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('toggles the drawer and aria-expanded via the menu and close buttons', async ({ page }) => {
        const close = page.locator('.site-nav__close');
        const menu = page.locator('.site-nav');
        const toggle = page.locator('.nav-toggle');

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

    test('moves focus into the drawer and exposes the extra links', async ({ page }) => {
        const menu = page.locator('.site-nav');

        await page.locator('.nav-toggle').click();

        await expect(menu).toBeVisible();
        await expect(page.locator('.site-nav__close')).toBeFocused();
        await expect(menu.locator(`a[href="${PITCH_DECK_URL}"]`)).toBeVisible();
        await expect(menu.locator(`a[href="${CALENDLY_URL}"]`)).toBeVisible();
    });

    test('traps tab focus across the open drawer', async ({ page }) => {
        const close = page.locator('.site-nav__close');
        const links = page.locator('.site-nav a');

        await page.locator('.nav-toggle').click();

        await expect(close).toBeFocused();
        await page.waitForTimeout(FOCUS_SETTLE);

        await page.keyboard.press('Shift+Tab');

        await expect(links.last()).toBeFocused();

        await page.keyboard.press('Tab');

        await expect(close).toBeFocused();
    });

    test('closes on escape and restores focus to the toggle', async ({ page }) => {
        const menu = page.locator('.site-nav');
        const toggle = page.locator('.nav-toggle');

        await toggle.click();

        await expect(page.locator('.site-nav__close')).toBeFocused();

        await page.keyboard.press('Escape');

        await expect(menu).toBeHidden();
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(toggle).toBeFocused();
    });
});
