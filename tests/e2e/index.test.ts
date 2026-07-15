import { expect, test } from '@playwright/test';

const DESCRIPTION_MAX = 160;
const DESCRIPTION_MIN = 120;
const POSH_URL = 'https://posh.vip/e/austin-texas-music-video-film-festival';
const SECTIONS = ['.hero', '.tagline', '.details', '.experience', '.marquee'] as const;
const SPONSOR_URL = 'https://form.jotform.com/261316235757055';

test.describe('index page', () => {
    test.beforeEach(async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/');
    });

    test('loads with the festival title', async ({ page }) => {
        await expect(page).toHaveTitle('Austin Music Video Film Festival');
    });

    test('labels the hero logo with the festival name', async ({ page }) => {
        await expect(page.locator('.hero__logo')).toHaveAttribute('alt', 'Austin Music Video Film Festival');
    });

    test('links Buy Tickets to the external ticketing page in a new tab', async ({ page }) => {
        const tickets = page.locator('.hero__content').getByRole('link', { name: 'Buy Tickets' });

        await expect(tickets).toHaveAttribute('href', POSH_URL);
        await expect(tickets).toHaveAttribute('target', '_blank');
    });

    test('offers a Sponsor Us call to action', async ({ page }) => {
        const sponsor = page.locator('.hero__content').getByRole('link', { name: 'Sponsor Us' });

        await expect(sponsor).toBeVisible();
        await expect(sponsor).toHaveAttribute('href', SPONSOR_URL);
        await expect(sponsor).toHaveAttribute('target', '_blank');
    });

    test('exposes a meta description of the expected length', async ({ page }) => {
        const description = await page.locator('meta[name="description"]').getAttribute('content');

        expect(description).not.toBeNull();
        expect(String(description).length).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
        expect(String(description).length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    });

    test('names the site in its open graph metadata', async ({ page }) => {
        await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Austin Music Video Film Festival');
    });

    test('composes the home sections in order', async ({ page }) => {
        const ordered = await page.evaluate((selectors) => {
            const elements = selectors.map(selector => document.querySelector(selector));

            if (elements.some(element => !element)) return false;

            return selectors.every((_, index) => {
                const current = elements[index];
                const previous = elements[index - 1];

                return index === 0
                    || Boolean(previous && current && previous.compareDocumentPosition(current) & Node.DOCUMENT_POSITION_FOLLOWING);
            });
        }, [...SECTIONS]);

        expect(ordered).toBe(true);
    });
});

test.describe('index countdown', () => {
    test('ticks the hero countdown values every second', async ({ page }) => {
        await page.goto('/');

        const seconds = page.locator('.hero__countdown-number[data-unit="seconds"]');
        const first = (await seconds.textContent())?.trim();

        await expect.poll(async () => (await seconds.textContent())?.trim(), { timeout: 3_000 }).not.toBe(first);
    });
});
